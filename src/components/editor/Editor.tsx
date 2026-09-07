import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import type { Note } from '../../types';
import { useNotesStore } from '../../store/useNotesStore';
import { useAiStore } from '../../store/useAiStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { blocksToMarkdown, downloadMarkdownFile } from '../../utils/markdown';
import { AiModal } from '../ai/AiModal';
import { AiSettingsModal } from '../ai/AiSettingsModal';
import { 
  Pin, 
  Star, 
  Archive, 
  Trash2, 
  Download, 
  Folder as FolderIcon,
  Plus,
  X,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface EditorProps {
  note: Note;
}

export const Editor: React.FC<EditorProps> = ({ note }) => {
  const { 
    updateNote, 
    deleteNote, 
    togglePin, 
    toggleFavorite, 
    toggleArchive, 
    folders, 
    tags, 
    createTag 
  } = useNotesStore();

  const { isAiModalOpen, setIsAiModalOpen } = useAiStore();
  const { t } = useLanguageStore();
  const { theme } = useThemeStore();

  const [title, setTitle] = useState(note.title);
  const [newTagName, setNewTagName] = useState('');
  const [isTagInputOpen, setIsTagInputOpen] = useState(false);
  const debounceTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
  }, [note.id]);

  const initialContent = useMemo(() => {
    if (note.content && Array.isArray(note.content) && note.content.length > 0) {
      return note.content as Block[];
    }
    return undefined;
  }, [note.id]);

  const handleUploadFile = async (file: File): Promise<string> => {
    if (file.size > 10 * 1024 * 1024) {
      alert(t.imageUploadingTooBig);
      throw new Error('File too large');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const editor = useCreateBlockNote({
    initialContent: initialContent,
    uploadFile: handleUploadFile
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateNote(note.id, { title: newTitle || t.untitled });
    }, 400);
  };

  const handleEditorChange = () => {
    if (!editor) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      const blocks = editor.document;
      const plainText = blocksToMarkdown(blocks);
      updateNote(note.id, {
        content: blocks,
        plainText: plainText
      });
    }, 600);
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${note.title}\n\n` + (editor ? blocksToMarkdown(editor.document) : '');
    downloadMarkdownFile(note.title || 'Note', mdContent);
  };

  const handleAddTag = async (tagName: string) => {
    const cleaned = tagName.trim().toLowerCase();
    if (!cleaned) return;
    if (!note.tags.includes(cleaned)) {
      const updatedTags = [...note.tags, cleaned];
      await updateNote(note.id, { tags: updatedTags });
      if (!tags.some(t => t.name === cleaned)) {
        await createTag(cleaned);
      }
    }
    setNewTagName('');
    setIsTagInputOpen(false);
  };

  const handleRemoveTag = async (tagName: string) => {
    const updatedTags = note.tags.filter(t => t !== tagName);
    await updateNote(note.id, { tags: updatedTags });
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    await updateNote(note.id, { folderId: val === '' ? null : val });
  };

  const handleInsertSummary = (summaryText: string) => {
    if (!editor) return;
    const currentBlocks = editor.document;
    
    const summaryHeading: any = {
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Резюме', styles: {} }]
    };

    const summaryBlock: any = {
      type: 'paragraph',
      content: [{ type: 'text', text: summaryText, styles: {} }]
    };

    editor.replaceBlocks(currentBlocks, [summaryHeading, summaryBlock, ...currentBlocks]);
  };

  const handleImagePicker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      const base64Url = await handleUploadFile(file);
      const imageBlock: any = {
        type: 'image',
        props: {
          url: base64Url,
          caption: file.name
        }
      };
      editor.insertBlocks([imageBlock], editor.getTextCursorPosition().block, 'after');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-theme-primary text-theme-primary overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-6 py-3 border-b border-theme bg-theme-primary/80 backdrop-blur z-10">
        <div className="flex items-center gap-3 text-sm text-theme-secondary">
          <div className="flex items-center gap-1.5 bg-theme-hover px-2.5 py-1 rounded-md border border-theme">
            <FolderIcon className="w-3.5 h-3.5 text-theme-accent" />
            <select
              value={note.folderId || ''}
              onChange={handleFolderChange}
              className="bg-transparent text-xs text-theme-primary outline-none cursor-pointer"
            >
              <option value="" className="bg-theme-card text-theme-primary">{t.folders} (0)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-theme-card text-theme-primary">
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          
          <span className="text-xs text-theme-muted">
            {t.lastEdited}: {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImagePicker}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title={t.imageUpload}
            className="p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-hover transition cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer active:scale-95 mr-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aiAssistant}</span>
          </button>

          <button
            onClick={() => togglePin(note.id)}
            title={note.isPinned ? t.unpinNote : t.pinNote}
            className={`p-2 rounded-md hover:bg-theme-hover transition cursor-pointer ${
              note.isPinned ? 'text-amber-500 bg-amber-500/10' : 'text-theme-secondary'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavorite(note.id)}
            title={note.isFavorite ? t.unfavoriteNote : t.favoriteNote}
            className={`p-2 rounded-md hover:bg-theme-hover transition cursor-pointer ${
              note.isFavorite ? 'text-yellow-500 bg-yellow-500/10 fill-yellow-500' : 'text-theme-secondary'
            }`}
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-yellow-500' : ''}`} />
          </button>

          <button
            onClick={handleExportMarkdown}
            title={t.exportMarkdown}
            className="p-2 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-hover transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleArchive(note.id)}
            title={note.isArchived ? t.unarchiveNote : t.archiveNote}
            className={`p-2 rounded-md hover:bg-theme-hover transition cursor-pointer ${
              note.isArchived ? 'text-theme-accent bg-theme-accent-light' : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm(`${t.deletePermanently}?`)) {
                deleteNote(note.id);
              }
            }}
            title={t.deleteNote}
            className="p-2 rounded-md text-theme-secondary hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 max-w-4xl w-full mx-auto">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={t.untitled}
          className="w-full text-3xl md:text-4xl font-bold bg-transparent outline-none text-theme-primary placeholder:text-theme-muted mb-4"
        />

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-theme-accent-light text-theme-accent border border-theme-accent"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-rose-400 transition cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isTagInputOpen ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag(newTagName);
                  if (e.key === 'Escape') setIsTagInputOpen(false);
                }}
                autoFocus
                placeholder="тег..."
                className="px-2 py-0.5 text-xs bg-theme-input border border-theme rounded text-theme-primary outline-none w-24"
              />
              <button
                onClick={() => handleAddTag(newTagName)}
                className="p-1 hover:text-theme-accent text-theme-muted cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsTagInputOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-theme-muted hover:text-theme-primary hover:bg-theme-hover border border-dashed border-theme transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              {t.addTagPlaceholder}
            </button>
          )}
        </div>

        <div className={`min-h-[400px] text-theme-primary ${theme === 'light' || theme === 'sepia' ? 'blocknote-light-theme' : 'blocknote-dark-theme'}`}>
          <BlockNoteView
            editor={editor}
            theme={theme === 'light' || theme === 'sepia' ? 'light' : 'dark'}
            onChange={handleEditorChange}
          />
        </div>
      </div>

      <AiModal
        note={note}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onInsertSummary={handleInsertSummary}
      />
      <AiSettingsModal />
    </div>
  );
};