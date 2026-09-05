import { create } from 'zustand';
import type { Note, Folder, Tag, ViewFilter } from '../types';
import { notesRepository } from '../db/notesRepository';
import { generateUUID } from '../utils/uuid';
import { syncEngine } from '../sync/syncEngine';

interface NotesState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  activeNoteId: string | null;
  activeFilter: ViewFilter;
  searchQuery: string;
  isLoading: boolean;
  isSidebarOpen: boolean;

  fetchNotes: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  fetchTags: () => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  setActiveFilter: (filter: ViewFilter) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  
  createNote: (folderId?: string | null) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  
  createFolder: (name: string, parentId?: string | null) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  
  createTag: (name: string) => Promise<Tag>;
  deleteTag: (name: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  folders: [],
  tags: [],
  activeNoteId: null,
  activeFilter: { type: 'all' },
  searchQuery: '',
  isLoading: false,
  isSidebarOpen: true,

  fetchNotes: async () => {
    const { activeFilter, searchQuery } = get();
    if (searchQuery.trim()) {
      const results = await notesRepository.searchNotes(searchQuery);
      set({ notes: results });
    } else {
      const results = await notesRepository.getFilteredNotes(activeFilter);
      set({ notes: results });
    }
  },

  fetchFolders: async () => {
    const folders = await notesRepository.getAllFolders();
    set({ folders });
  },

  fetchTags: async () => {
    const tags = await notesRepository.getAllTags();
    set({ tags });
  },

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setActiveFilter: (filter) => {
    set({ activeFilter: filter, searchQuery: '' });
    get().fetchNotes();
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchNotes();
  },
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  createNote: async (folderId = null) => {
    const { activeFilter } = get();
    let initialFolderId = folderId;
    let initialTags: string[] = [];

    if (!initialFolderId && activeFilter.type === 'folder') {
      initialFolderId = activeFilter.folderId;
    }
    if (activeFilter.type === 'tag') {
      initialTags = [activeFilter.tag];
    }

    const now = Date.now();
    const newNote: Note = {
      id: generateUUID(),
      title: 'Без назви',
      content: [],
      plainText: '',
      folderId: initialFolderId,
      tags: initialTags,
      isPinned: false,
      isArchived: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      synced: false
    };

    await notesRepository.saveNote(newNote);
    await get().fetchNotes();
    set({ activeNoteId: newNote.id });
    syncEngine.triggerSync();
    return newNote;
  },

  updateNote: async (id, updates) => {
    const note = await notesRepository.getNoteById(id);
    if (!note) return;

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: Date.now(),
      synced: false
    };

    await notesRepository.saveNote(updatedNote);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n))
    }));
    syncEngine.triggerSync();
  },

  deleteNote: async (id) => {
    await notesRepository.deleteNote(id);
    const { activeNoteId } = get();
    if (activeNoteId === id) {
      set({ activeNoteId: null });
    }
    await get().fetchNotes();
    syncEngine.triggerSync();
  },

  togglePin: async (id) => {
    const note = await notesRepository.getNoteById(id);
    if (!note) return;
    await get().updateNote(id, { isPinned: !note.isPinned });
    await get().fetchNotes();
  },

  toggleFavorite: async (id) => {
    const note = await notesRepository.getNoteById(id);
    if (!note) return;
    await get().updateNote(id, { isFavorite: !note.isFavorite });
    await get().fetchNotes();
  },

  toggleArchive: async (id) => {
    const note = await notesRepository.getNoteById(id);
    if (!note) return;
    await get().updateNote(id, { isArchived: !note.isArchived });
    await get().fetchNotes();
  },

  createFolder: async (name, parentId = null) => {
    const folder: Folder = {
      id: generateUUID(),
      name,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await notesRepository.saveFolder(folder);
    await get().fetchFolders();
    syncEngine.triggerSync();
    return folder;
  },

  deleteFolder: async (id) => {
    await notesRepository.deleteFolder(id);
    const { activeFilter } = get();
    if (activeFilter.type === 'folder' && activeFilter.folderId === id) {
      set({ activeFilter: { type: 'all' } });
    }
    await get().fetchFolders();
    await get().fetchNotes();
    syncEngine.triggerSync();
  },

  createTag: async (name) => {
    const trimmed = name.trim().toLowerCase();
    const tag: Tag = {
      id: generateUUID(),
      name: trimmed
    };
    await notesRepository.saveTag(tag);
    await get().fetchTags();
    syncEngine.triggerSync();
    return tag;
  },

  deleteTag: async (name) => {
    await notesRepository.deleteTag(name);
    const { activeFilter } = get();
    if (activeFilter.type === 'tag' && activeFilter.tag === name) {
      set({ activeFilter: { type: 'all' } });
    }
    await get().fetchTags();
    await get().fetchNotes();
    syncEngine.triggerSync();
  }
}));