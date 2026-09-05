import React, { useState } from 'react';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSyncStore } from '../../store/useSyncStore';
import { useAiStore } from '../../store/useAiStore';
import type { ViewFilter } from '../../types';
import { 
  FileText, 
  Star, 
  Pin, 
  Archive, 
  Folder as FolderIcon, 
  FolderPlus, 
  Tag as TagIcon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { 
    activeFilter, 
    setActiveFilter, 
    folders, 
    createFolder, 
    deleteFolder, 
    tags, 
    deleteTag, 
    createNote,
    isSidebarOpen 
  } = useNotesStore();

  const { user, token, setIsAuthModalOpen } = useAuthStore();
  const { status } = useSyncStore();
  const { setIsSettingsOpen } = useAiStore();

  const [isFoldersOpen, setIsFoldersOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  if (!isSidebarOpen) return null;

  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const isSelected = (filter: ViewFilter) => {
    if (activeFilter.type !== filter.type) return false;
    if (filter.type === 'folder' && activeFilter.type === 'folder') {
      return activeFilter.folderId === filter.folderId;
    }
    if (filter.type === 'tag' && activeFilter.type === 'tag') {
      return activeFilter.tag === filter.tag;
    }
    return true;
  };

  const handleFilterClick = (filter: ViewFilter) => {
    setActiveFilter(filter);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSyncBadge = () => {
    if (!token) {
      return (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/50 transition cursor-pointer"
        >
          <CloudOff className="w-3.5 h-3.5 text-slate-400" />
          <span>Локально</span>
        </button>
      );
    }

    switch (status) {
      case 'syncing':
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/15 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Синхронізація</span>
          </button>
        );
      case 'synced':
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/15 text-emerald-300 rounded-lg text-xs font-medium border border-emerald-500/30 transition cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[80px]">{user?.name || 'Хмара'}</span>
          </button>
        );
      case 'error':
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/15 text-rose-300 rounded-lg text-xs font-medium border border-rose-500/30 transition cursor-pointer"
          >
            <CloudOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Помилка</span>
          </button>
        );
      case 'offline':
      default:
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 text-slate-400 rounded-lg text-xs font-medium border border-slate-700/50 transition cursor-pointer"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span>Офлайн</span>
          </button>
        );
    }
  };

  return (
    <aside className="w-64 bg-[#0d0f15] border-r border-slate-800/80 flex flex-col h-full select-none text-slate-300">
      {/* Header / Brand */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            N
          </div>
          <div>
            <h1 className="font-semibold text-sm text-slate-100 leading-none">Nullnotes</h1>
            <span className="text-[10px] text-slate-500 font-medium">Local-first Workspace</span>
          </div>
        </div>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Note Button */}
      <div className="p-3">
        <button
          onClick={() => {
            createNote();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-md shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Нова нотатка
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Core Views */}
        <div className="space-y-0.5">
          <button
            onClick={() => handleFilterClick({ type: 'all' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'all' })
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Всі нотатки
          </button>

          <button
            onClick={() => handleFilterClick({ type: 'favorites' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'favorites' })
                ? 'bg-yellow-500/15 text-yellow-400 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            Улюблені
          </button>

          <button
            onClick={() => handleFilterClick({ type: 'pinned' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'pinned' })
                ? 'bg-amber-500/15 text-amber-400 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Pin className="w-4 h-4" />
            Закріплені
          </button>

          <button
            onClick={() => handleFilterClick({ type: 'archived' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'archived' })
                ? 'bg-slate-800 text-slate-200 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            Архів
          </button>
        </div>

        {/* Folders Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <button
              onClick={() => setIsFoldersOpen(!isFoldersOpen)}
              className="flex items-center gap-1 hover:text-slate-300 cursor-pointer"
            >
              {isFoldersOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Папки
            </button>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 hover:text-indigo-400 hover:bg-slate-800 rounded transition cursor-pointer"
              title="Створити папку"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isFoldersOpen && (
            <div className="space-y-0.5">
              {isCreatingFolder && (
                <div className="px-2 py-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddFolder();
                      if (e.key === 'Escape') setIsCreatingFolder(false);
                    }}
                    autoFocus
                    placeholder="Назва папки..."
                    className="w-full text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none"
                  />
                </div>
              )}

              {folders.length === 0 && !isCreatingFolder && (
                <div className="px-3 py-1.5 text-xs text-slate-600 italic">Немає папок</div>
              )}

              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    isSelected({ type: 'folder', folderId: folder.id })
                      ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                  onClick={() => handleFilterClick({ type: 'folder', folderId: folder.id })}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Видалити папку "${folder.name}"?`)) {
                        deleteFolder(folder.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="flex items-center gap-1 hover:text-slate-300 cursor-pointer"
            >
              {isTagsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Теги
            </button>
          </div>

          {isTagsOpen && (
            <div className="space-y-0.5">
              {tags.length === 0 && (
                <div className="px-3 py-1.5 text-xs text-slate-600 italic">Немає тегів</div>
              )}

              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    isSelected({ type: 'tag', tag: tag.name })
                      ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                  onClick={() => handleFilterClick({ type: 'tag', tag: tag.name })}
                >
                  <div className="flex items-center gap-2 truncate">
                    <TagIcon className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span className="truncate">#{tag.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Видалити тег "#${tag.name}"?`)) {
                        deleteTag(tag.name);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings section in Sidebar */}
      <div className="px-3 py-2 border-t border-slate-800/60 space-y-1">
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Налаштування AI</span>
        </button>
      </div>

      {/* Footer / Account & Sync Status */}
      <div className="p-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {renderSyncBadge()}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-600">
          <Settings className="w-3 h-3 text-slate-500" />
          <span>v0.3.0</span>
        </div>
      </div>
    </aside>
  );
};