import React, { useEffect, useState } from 'react';
import { useNotesStore } from './store/useNotesStore';
import { useAuthStore } from './store/useAuthStore';
import { useAiStore } from './store/useAiStore';
import { syncEngine } from './sync/syncEngine';
import { Sidebar } from './components/sidebar/Sidebar';
import { NotesList } from './components/notes/NotesList';
import { Editor } from './components/editor/Editor';
import { AuthModal } from './components/auth/AuthModal';
import { AiSettingsModal } from './components/ai/AiSettingsModal';
import { FileText, Plus, Menu, ArrowLeft, User as UserIcon, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    notes, 
    activeNoteId, 
    setActiveNoteId, 
    fetchNotes, 
    fetchFolders, 
    fetchTags, 
    createNote 
  } = useNotesStore();

  const { token, setIsAuthModalOpen } = useAuthStore();
  const { setIsSettingsOpen } = useAiStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchFolders();
    fetchTags();
    fetchNotes();

    syncEngine.initAutoSync();
    if (token) {
      syncEngine.sync();
    }
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0f15] text-slate-200">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. Main Navigation Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:static transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      {/* 2. Notes Sub-List & Search */}
      <div className={`
        w-full md:w-80 flex-shrink-0 h-full
        ${activeNoteId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="w-full flex flex-col h-full">
          {/* Mobile Top bar */}
          <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-800 bg-[#0d0f15]">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm">Nullnotes</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-indigo-400 hover:text-white rounded-lg text-xs"
                title="Налаштування AI"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg text-xs"
                title="Акаунт"
              >
                <UserIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => createNote()}
                className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <NotesList />
        </div>
      </div>

      {/* 3. Block Editor Workspace */}
      <main className={`
        flex-1 flex-col h-full overflow-hidden
        ${activeNoteId ? 'flex' : 'hidden md:flex'}
      `}>
        {activeNote ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Mobile back to notes button */}
            <div className="md:hidden flex items-center px-4 py-2 bg-[#10121a] border-b border-slate-800">
              <button
                onClick={() => setActiveNoteId(null)}
                className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад до списку
              </button>
            </div>
            <Editor key={activeNote.id} note={activeNote} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-[#12141c]">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-center mb-4 text-slate-400 shadow-xl">
              <FileText className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg font-semibold text-slate-300 mb-1">Нотатку не вибрано</h2>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Створіть нову нотатку або оберіть існуючу зі списку ліворуч, щоб розпочати редагування.
            </p>
            <button
              onClick={() => createNote()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Створити нотатку
            </button>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <AiSettingsModal />
    </div>
  );
};

export default App;