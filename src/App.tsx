import React, { useEffect, useState } from 'react';
import { useNotesStore } from './store/useNotesStore';
import { useAuthStore } from './store/useAuthStore';
import { useAiStore } from './store/useAiStore';
import { useLanguageStore } from './store/useLanguageStore';
import { useThemeStore } from './store/useThemeStore';
import { useUpdateStore } from './store/useUpdateStore';
import { syncEngine } from './sync/syncEngine';
import { Sidebar } from './components/sidebar/Sidebar';
import { NotesList } from './components/notes/NotesList';
import { Editor } from './components/editor/Editor';
import { AuthModal } from './components/auth/AuthModal';
import { AiSettingsModal } from './components/ai/AiSettingsModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { UpdateModal } from './components/update/UpdateModal';
import { FileText, Plus, Menu, ArrowLeft, User as UserIcon, Sparkles, Settings } from 'lucide-react';

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
  const { setIsSettingsModalOpen } = useThemeStore();
  const { checkForUpdates } = useUpdateStore();
  const { t } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchFolders();
    fetchTags();
    fetchNotes();

    syncEngine.initAutoSync();
    if (token) {
      syncEngine.sync();
    }

    // Check for updates in background
    checkForUpdates();
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-theme-primary text-theme-primary">
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
          <div className="md:hidden flex items-center justify-between p-3 border-b border-theme bg-theme-sidebar">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-theme-muted hover:text-theme-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm text-theme-primary">Nullnotes</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1.5 text-theme-muted hover:text-theme-primary rounded-lg text-xs"
                title={t.generalSettings}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-theme-accent hover:opacity-80 rounded-lg text-xs"
                title={t.aiSettings}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-1.5 text-theme-muted hover:text-theme-primary rounded-lg text-xs"
                title={t.account}
              >
                <UserIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => createNote()}
                className="p-1.5 bg-theme-accent text-white rounded-lg text-xs hover:opacity-90"
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
            <div className="md:hidden flex items-center px-4 py-2 bg-theme-secondary border-b border-theme">
              <button
                onClick={() => setActiveNoteId(null)}
                className="flex items-center gap-1.5 text-xs text-theme-accent font-medium py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.backToList}
              </button>
            </div>
            <Editor key={activeNote.id} note={activeNote} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-theme-primary">
            <div className="w-16 h-16 rounded-2xl bg-theme-hover border border-theme flex items-center justify-center mb-4 text-theme-muted shadow-xl">
              <FileText className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg font-semibold text-theme-primary mb-1">{t.noNoteSelected}</h2>
            <p className="text-xs text-theme-muted max-w-sm mb-6">
              {t.selectNotePrompt}
            </p>
            <button
              onClick={() => createNote()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-medium transition shadow-lg active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              {t.newNote}
            </button>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <AiSettingsModal />
      <SettingsModal />
      <UpdateModal />
    </div>
  );
};

export default App;