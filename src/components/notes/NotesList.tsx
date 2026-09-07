import React from 'react';
import { useNotesStore } from '../../store/useNotesStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { 
  Search, 
  Pin, 
  Star, 
  FileText, 
  Folder as FolderIcon
} from 'lucide-react';

export const NotesList: React.FC = () => {
  const { 
    notes, 
    activeNoteId, 
    setActiveNoteId, 
    searchQuery, 
    setSearchQuery, 
    folders, 
    activeFilter 
  } = useNotesStore();

  const { t, language } = useLanguageStore();

  const getFolderTitle = () => {
    switch (activeFilter.type) {
      case 'all': return t.allNotes;
      case 'favorites': return t.favorites;
      case 'pinned': return t.pinned;
      case 'archived': return t.archive;
      case 'folder': {
        const folder = folders.find(f => f.id === activeFilter.folderId);
        return folder ? folder.name : t.folders;
      }
      case 'tag': return `#${activeFilter.tag}`;
      default: return t.notesCount;
    }
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    return folders.find(f => f.id === folderId)?.name;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 bg-theme-secondary border-r border-theme flex flex-col h-full select-none text-theme-primary">
      <div className="p-4 border-b border-theme space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-theme-primary flex items-center gap-2">
            {getFolderTitle()}
            <span className="text-xs font-normal text-theme-muted bg-theme-hover px-2 py-0.5 rounded-full border border-theme">
              {notes.length}
            </span>
          </h2>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-theme-input border border-theme rounded-lg pl-9 pr-3 py-1.5 text-xs text-theme-primary placeholder:text-theme-muted outline-none focus:border-theme-accent transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notes.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-theme-muted">
            <FileText className="w-8 h-8 mb-2 opacity-50 stroke-[1.5]" />
            <p className="text-xs">{t.noNotes}</p>
          </div>
        ) : (
          notes.map((note) => {
            const isSelected = activeNoteId === note.id;
            const folderName = getFolderName(note.folderId);

            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-theme-accent-light border-theme-accent text-theme-primary shadow-xs'
                    : 'bg-theme-card border-theme-subtle hover:bg-theme-hover hover:border-theme text-theme-secondary'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xs font-semibold truncate flex-1 text-theme-primary">
                    {note.title || t.untitled}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                    {note.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                </div>

                <p className="text-[11px] text-theme-muted line-clamp-2 leading-relaxed mb-2">
                  {note.plainText || t.emptyNote}
                </p>

                <div className="flex items-center justify-between text-[10px] text-theme-muted pt-1 border-t border-theme-subtle">
                  <div className="flex items-center gap-2 truncate">
                    {folderName && (
                      <span className="flex items-center gap-1 text-theme-secondary truncate">
                        <FolderIcon className="w-2.5 h-2.5" />
                        {folderName}
                      </span>
                    )}
                    {note.tags.length > 0 && (
                      <span className="text-theme-accent font-medium truncate">
                        #{note.tags[0]}
                        {note.tags.length > 1 ? ` +${note.tags.length - 1}` : ''}
                      </span>
                    )}
                  </div>
                  
                  <span className="flex-shrink-0">{formatDate(note.updatedAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};