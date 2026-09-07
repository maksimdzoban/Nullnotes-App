import React from 'react';
import { useUpdateStore } from '../../store/useUpdateStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { updateService } from '../../services/updateService';
import { Download, Sparkles, X, CheckCircle } from 'lucide-react';

export const UpdateModal: React.FC = () => {
  const { isUpdateModalOpen, setIsUpdateModalOpen, latestRelease, currentVersion } = useUpdateStore();
  const { t } = useLanguageStore();

  if (!isUpdateModalOpen || !latestRelease) return null;

  const handleUpdate = () => {
    updateService.triggerDownload(latestRelease);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-theme-card border border-theme rounded-2xl shadow-2xl overflow-hidden text-theme-primary flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-secondary">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-theme-accent-light text-theme-accent rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-theme-primary">
                {t.language === 'uk' ? 'Доступне нове оновлення!' : 'New Update Available!'}
              </h2>
              <p className="text-[11px] text-theme-muted">
                {currentVersion} &rarr; {latestRelease.version}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsUpdateModalOpen(false)}
            className="p-1.5 text-theme-muted hover:text-theme-primary rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Changelog Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="p-3.5 bg-theme-secondary border border-theme rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-theme-accent">{latestRelease.name}</span>
              <span className="text-[11px] text-theme-muted">
                {new Date(latestRelease.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-xs text-theme-secondary whitespace-pre-line leading-relaxed">
              {latestRelease.changelog}
            </div>
          </div>

          <div className="p-3 bg-theme-hover rounded-xl text-[11px] text-theme-muted flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              {t.language === 'uk'
                ? 'Оновлення встановлюється поверх поточного додатку без втрати локальних нотаток.'
                : 'The update installs over the existing app without losing your local notes.'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-theme-secondary border-t border-theme flex items-center justify-end gap-2.5">
          <button
            onClick={() => setIsUpdateModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-theme-secondary hover:text-theme-primary transition cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleUpdate}
            className="flex items-center gap-2 px-5 py-2 bg-theme-accent hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{t.language === 'uk' ? 'Завантажити та оновити' : 'Download & Update'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};