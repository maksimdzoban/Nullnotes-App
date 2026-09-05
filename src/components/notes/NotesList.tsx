import React from 'react';
import { useNotesStore } from '../../store/useNotesStore';
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

  const getFolderTitle = () => {
    switch (activeFilter.type) {
      case 'all': return 'Всі нотатки';
      case 'favorites': return 'Улюблені';
      case 'pinned': return 'Закріплені';
      case 'archived': return 'Архів';
      case 'folder': {
        const folder = folders.find(f => f.id === activeFilter.folderId);
        return folder ? folder.name : 'Папка';
      }
      case 'tag': return `#${activeFilter.tag}`;
      default: return 'Нотатки';
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
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 bg-[#10121a] border-r border-slate-800/80 flex flex-col h-full select-none">
      <div className="p-4 border-b border-slate-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            {getFolderTitle()}
            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          </h2>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Швидкий пошук..."
            className="w-full bg-[#181b26] border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/80 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notes.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-slate-600">
            <FileText className="w-8 h-8 mb-2 opacity-50 stroke-[1.5]" />
            <p className="text-xs">Нотаток не знайдено</p>
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
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-slate-100'
                    : 'bg-[#141722]/50 border-slate-800/50 hover:bg-[#181b27] hover:border-slate-700/50 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xs font-semibold truncate flex-1">
                    {note.title || 'Без назви'}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-400" />}
                    {note.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {note.plainText || 'Порожня нотатка...'}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                  <div className="flex items-center gap-2 truncate">
                    {folderName && (
                      <span className="flex items-center gap-1 text-slate-400 truncate">
                        <FolderIcon className="w-2.5 h-2.5" />
                        {folderName}
                      </span>
                    )}
                    {note.tags.length > 0 && (
                      <span className="text-indigo-400 font-medium truncate">
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