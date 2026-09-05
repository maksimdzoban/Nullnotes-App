import { db } from './db';
import type { Note, Folder, Tag, ViewFilter } from '../types';

export const notesRepository = {
  async getAllNotes(): Promise<Note[]> {
    return await db.notes.orderBy('updatedAt').reverse().toArray();
  },

  async getNoteById(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  },

  async saveNote(note: Note, fromSync = false): Promise<string> {
    await db.notes.put(note);
    if (!fromSync) {
      await db.outbox.add({
        entityType: 'note',
        entityId: note.id,
        action: 'update',
        payload: note,
        createdAt: Date.now()
      });
    }
    return note.id;
  },

  async deleteNote(id: string, fromSync = false): Promise<void> {
    await db.notes.delete(id);
    if (!fromSync) {
      await db.outbox.add({
        entityType: 'note',
        entityId: id,
        action: 'delete',
        payload: { id },
        createdAt: Date.now()
      });
    }
  },

  async searchNotes(query: string): Promise<Note[]> {
    if (!query.trim()) return this.getAllNotes();
    const q = query.toLowerCase();
    return await db.notes
      .filter((note) => {
        const titleMatch = note.title.toLowerCase().includes(q);
        const plainTextMatch = note.plainText ? note.plainText.toLowerCase().includes(q) : false;
        const tagMatch = note.tags.some(t => t.toLowerCase().includes(q));
        return titleMatch || plainTextMatch || tagMatch;
      })
      .reverse()
      .sortBy('updatedAt');
  },

  async getFilteredNotes(filter: ViewFilter): Promise<Note[]> {
    const collection = db.notes.toCollection();

    switch (filter.type) {
      case 'all':
        return await db.notes.filter(n => !n.isArchived).reverse().sortBy('updatedAt');
      case 'favorites':
        return await db.notes.filter(n => n.isFavorite && !n.isArchived).reverse().sortBy('updatedAt');
      case 'pinned':
        return await db.notes.filter(n => n.isPinned && !n.isArchived).reverse().sortBy('updatedAt');
      case 'archived':
        return await db.notes.filter(n => n.isArchived).reverse().sortBy('updatedAt');
      case 'folder':
        return await db.notes.filter(n => n.folderId === filter.folderId && !n.isArchived).reverse().sortBy('updatedAt');
      case 'tag':
        return await db.notes.filter(n => n.tags.includes(filter.tag) && !n.isArchived).reverse().sortBy('updatedAt');
      default:
        return await collection.toArray();
    }
  },

  // Folders
  async getAllFolders(): Promise<Folder[]> {
    return await db.folders.orderBy('name').toArray();
  },

  async saveFolder(folder: Folder, fromSync = false): Promise<string> {
    await db.folders.put(folder);
    if (!fromSync) {
      await db.outbox.add({
        entityType: 'folder',
        entityId: folder.id,
        action: 'update',
        payload: folder,
        createdAt: Date.now()
      });
    }
    return folder.id;
  },

  async deleteFolder(id: string, fromSync = false): Promise<void> {
    await db.folders.delete(id);
    if (!fromSync) {
      await db.outbox.add({
        entityType: 'folder',
        entityId: id,
        action: 'delete',
        payload: { id },
        createdAt: Date.now()
      });
    }
    // Unlink notes from deleted folder
    const notesInFolder = await db.notes.where('folderId').equals(id).toArray();
    for (const note of notesInFolder) {
      await this.saveNote({ ...note, folderId: null, updatedAt: Date.now() }, fromSync);
    }
  },

  // Tags
  async getAllTags(): Promise<Tag[]> {
    return await db.tags.orderBy('name').toArray();
  },

  async saveTag(tag: Tag, fromSync = false): Promise<string> {
    await db.tags.put(tag);
    if (!fromSync) {
      await db.outbox.add({
        entityType: 'tag',
        entityId: tag.id,
        action: 'update',
        payload: tag,
        createdAt: Date.now()
      });
    }
    return tag.id;
  },

  async deleteTag(tagName: string, fromSync = false): Promise<void> {
    const tag = await db.tags.where('name').equals(tagName).first();
    if (tag) {
      await db.tags.delete(tag.id);
      if (!fromSync) {
        await db.outbox.add({
          entityType: 'tag',
          entityId: tag.id,
          action: 'delete',
          payload: { id: tag.id, name: tagName },
          createdAt: Date.now()
        });
      }
    }
    // Remove tag from notes
    const allNotes = await db.notes.toArray();
    for (const note of allNotes) {
      if (note.tags.includes(tagName)) {
        await this.saveNote({
          ...note,
          tags: note.tags.filter(t => t !== tagName),
          updatedAt: Date.now()
        }, fromSync);
      }
    }
  }
};