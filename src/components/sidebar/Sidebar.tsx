import React, { useState } from 'react';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSyncStore } from '../../store/useSyncStore';
import { useAiStore } from '../../store/useAiStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';
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
  const { setIsSettingsModalOpen } = useThemeStore();
  const { t } = useLanguageStore();

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
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-hover hover:opacity-80 text-theme-secondary rounded-lg text-xs font-medium border border-theme transition cursor-pointer"
        >
          <CloudOff className="w-3.5 h-3.5 text-theme-muted" />
          <span>{t.syncLocal}</span>
        </button>
      );
    }

    switch (status) {
      case 'syncing':
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-accent-light text-theme-accent rounded-lg text-xs font-medium border border-theme transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-theme-accent" />
            <span>{t.syncing}</span>
          </button>
        );
      case 'synced':
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30 transition cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[80px]">{user?.name || t.syncSynced}</span>
          </button>
        );
      case 'error':
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/15 text-rose-400 rounded-lg text-xs font-medium border border-rose-500/30 transition cursor-pointer"
          >
            <CloudOff className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.syncError}</span>
          </button>
        );
      case 'offline':
      default:
        return (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-theme-hover text-theme-muted rounded-lg text-xs font-medium border border-theme transition cursor-pointer"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span>{t.syncOffline}</span>
          </button>
        );
    }
  };

  return (
    <aside className="w-64 bg-theme-sidebar border-r border-theme flex flex-col h-full select-none text-theme-secondary">
      {/* Header / Brand */}
      <div className="p-4 flex items-center justify-between border-b border-theme">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-theme-accent flex items-center justify-center text-white font-bold shadow-lg shadow-black/10">
            N
          </div>
          <div>
            <h1 className="font-semibold text-sm text-theme-primary leading-none">Nullnotes</h1>
            <span className="text-[10px] text-theme-muted font-medium">Local-first Workspace</span>
          </div>
        </div>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden p-1 text-theme-muted hover:text-theme-primary">
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
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-theme-accent hover:opacity-90 text-white rounded-lg text-sm font-medium transition shadow-md active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.newNote}
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
                ? 'bg-theme-accent-light text-theme-accent font-semibold'
                : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t.allNotes}
          </button>

          <button
            onClick={() => handleFilterClick({ type: 'favorites' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'favorites' })
                ? 'bg-yellow-500/15 text-yellow-500 font-semibold'
                : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
            }`}
          >
            <Star className="w-4 h-4" />
            {t.favorites}
          </button>

          <button
            onClick={() => handleFilterClick({ type: 'pinned' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'pinned' })
                ? 'bg-amber-500/15 text-amber-500 font-semibold'
                : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
            }`}
          >
            <Pin className="w-4 h-4" />
            {t.pinned}
          </button>

          <button
            onClick={() => handleFilterClick({ type: 'archived' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSelected({ type: 'archived' })
                ? 'bg-theme-hover text-theme-primary font-semibold'
                : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
            }`}
          >
            <Archive className="w-4 h-4" />
            {t.archive}
          </button>
        </div>

        {/* Folders Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
            <button
              onClick={() => setIsFoldersOpen(!isFoldersOpen)}
              className="flex items-center gap-1 hover:text-theme-primary cursor-pointer"
            >
              {isFoldersOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {t.folders}
            </button>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 hover:text-theme-accent hover:bg-theme-hover rounded transition cursor-pointer"
              title={t.createFolder}
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
                    placeholder={t.folderNamePlaceholder}
                    className="w-full text-xs px-2 py-1 bg-theme-input border border-theme rounded text-theme-primary outline-none"
                  />
                </div>
              )}

              {folders.length === 0 && !isCreatingFolder && (
                <div className="px-3 py-1.5 text-xs text-theme-muted italic">{t.noFolders}</div>
              )}

              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    isSelected({ type: 'folder', folderId: folder.id })
                      ? 'bg-theme-accent-light text-theme-accent font-semibold'
                      : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
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
                      if (confirm(`${t.deleteFolderConfirm} "${folder.name}"?`)) {
                        deleteFolder(folder.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-theme-muted hover:text-rose-400 transition cursor-pointer"
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
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="flex items-center gap-1 hover:text-theme-primary cursor-pointer"
            >
              {isTagsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {t.tags}
            </button>
          </div>

          {isTagsOpen && (
            <div className="space-y-0.5">
              {tags.length === 0 && (
                <div className="px-3 py-1.5 text-xs text-theme-muted italic">{t.noTags}</div>
              )}

              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    isSelected({ type: 'tag', tag: tag.name })
                      ? 'bg-theme-accent-light text-theme-accent font-semibold'
                      : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                  }`}
                  onClick={() => handleFilterClick({ type: 'tag', tag: tag.name })}
                >
                  <div className="flex items-center gap-2 truncate">
                    <TagIcon className="w-3.5 h-3.5 flex-shrink-0 text-theme-muted" />
                    <span className="truncate">#{tag.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`${t.deleteTagConfirm} "#${tag.name}"?`)) {
                        deleteTag(tag.name);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-theme-muted hover:text-rose-400 transition cursor-pointer"
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
      <div className="px-3 py-2 border-t border-theme space-y-1">
        <button
          onClick={() => {
            setIsSettingsModalOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-theme-secondary hover:bg-theme-hover hover:text-theme-primary transition cursor-pointer"
        >
          <Settings className="w-4 h-4 text-theme-accent" />
          <span>{t.generalSettings}</span>
        </button>

        <button
          onClick={() => {
            setIsSettingsOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-theme-secondary hover:bg-theme-hover hover:text-theme-primary transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-theme-accent" />
          <span>{t.aiSettings}</span>
        </button>
      </div>

      {/* Footer / Account & Sync Status */}
      <div className="p-3 border-t border-theme flex items-center justify-between text-xs text-theme-muted">
        <div className="flex items-center gap-2">
          {renderSyncBadge()}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-theme-muted">
          <span>v0.3.0</span>
        </div>
      </div>
    </aside>
  );
};