import React from 'react';
import { useThemeStore, type ThemeMode, type AccentColor } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAiStore } from '../../store/useAiStore';
import { useUpdateStore } from '../../store/useUpdateStore';
import { 
  X, 
  Palette, 
  Globe, 
  Sparkles, 
  Check,
  RefreshCw,
  Download,
  CheckCircle,
  Smartphone
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    theme, 
    accent, 
    isSettingsModalOpen, 
    setIsSettingsModalOpen, 
    setTheme, 
    setAccent 
  } = useThemeStore();

  const { language, setLanguage, t } = useLanguageStore();
  const { setIsSettingsOpen } = useAiStore();
  const { 
    currentVersion, 
    isChecking, 
    hasUpdate, 
    latestRelease, 
    checkForUpdates, 
    checkStatusMessage, 
    setIsUpdateModalOpen 
  } = useUpdateStore();

  if (!isSettingsModalOpen) return null;

  const themes: { id: ThemeMode; name: string; desc: string; bgPreview: string; textPreview: string; borderPreview: string }[] = [
    { 
      id: 'dark', 
      name: t.themeDark, 
      desc: 'Dark Wave', 
      bgPreview: 'bg-[#0f1117]', 
      textPreview: 'text-slate-100', 
      borderPreview: 'border-slate-700' 
    },
    { 
      id: 'oled', 
      name: t.themeOled, 
      desc: 'Pure Black', 
      bgPreview: 'bg-black', 
      textPreview: 'text-white', 
      borderPreview: 'border-zinc-800' 
    },
    { 
      id: 'light', 
      name: t.themeLight, 
      desc: 'Clean White', 
      bgPreview: 'bg-white', 
      textPreview: 'text-slate-900', 
      borderPreview: 'border-slate-300' 
    },
    { 
      id: 'sepia', 
      name: t.themeSepia, 
      desc: 'Warm Paper', 
      bgPreview: 'bg-[#fbf0d9]', 
      textPreview: 'text-[#433422]', 
      borderPreview: 'border-[#dfcaa2]' 
    }
  ];

  const accents: { id: AccentColor; name: string; colorClass: string }[] = [
    { id: 'indigo', name: t.accentIndigo, colorClass: 'bg-[#6366f1]' },
    { id: 'emerald', name: t.accentEmerald, colorClass: 'bg-[#10b981]' },
    { id: 'amber', name: t.accentAmber, colorClass: 'bg-[#f59e0b]' },
    { id: 'rose', name: t.accentRose, colorClass: 'bg-[#f43f5e]' },
    { id: 'sky', name: t.accentSky, colorClass: 'bg-[#0ea5e9]' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-theme-card border border-theme rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-theme-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme bg-theme-secondary">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-theme-accent-light text-theme-accent rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-theme-primary">{t.generalSettings}</h2>
              <p className="text-xs text-theme-muted">{t.settings}</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-hover rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Language Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-theme-accent" />
              <h3 className="text-sm font-semibold text-theme-primary">{t.language}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('uk')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  language === 'uk'
                    ? 'border-theme-accent bg-theme-accent-light text-theme-accent'
                    : 'border-theme bg-theme-secondary hover:border-theme text-theme-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-theme-accent">UA</span>
                  <span className="text-sm font-medium">Українська</span>
                </div>
                {language === 'uk' && <Check className="w-4 h-4 text-theme-accent" />}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  language === 'en'
                    ? 'border-theme-accent bg-theme-accent-light text-theme-accent'
                    : 'border-theme bg-theme-secondary hover:border-theme text-theme-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-theme-accent">EN</span>
                  <span className="text-sm font-medium">English</span>
                </div>
                {language === 'en' && <Check className="w-4 h-4 text-theme-accent" />}
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-theme-accent" />
              <h3 className="text-sm font-semibold text-theme-primary">{t.theme}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => setTheme(tItem.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                    tItem.bgPreview
                  } ${tItem.textPreview} ${tItem.borderPreview} ${
                    theme === tItem.id
                      ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-card)] scale-[1.02]'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold">{tItem.name}</div>
                    <div className="text-[11px] opacity-70">{tItem.desc}</div>
                  </div>
                  {theme === tItem.id && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-sm font-semibold text-theme-primary mb-3">{t.accentColor}</h3>
            <div className="flex items-center gap-3">
              {accents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={`w-9 h-9 rounded-full ${a.colorClass} flex items-center justify-center transition cursor-pointer shadow-md ${
                    accent === a.id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-card)] scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={a.name}
                >
                  {accent === a.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* App Updates Section */}
          <div className="p-4 bg-theme-secondary border border-theme rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-theme-accent" />
                <span className="text-xs font-semibold text-theme-primary">{t.appVersion}</span>
              </div>
              <span className="text-xs font-mono font-medium text-theme-muted bg-theme-card px-2 py-0.5 rounded-md border border-theme">
                {currentVersion}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-theme-muted">
                {checkStatusMessage ? (
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {checkStatusMessage}
                  </span>
                ) : hasUpdate && latestRelease ? (
                  <span className="text-theme-accent font-medium">
                    {t.updateAvailable}: {latestRelease.version}
                  </span>
                ) : (
                  <span>{t.language === 'uk' ? 'Перевірте оновлення безпосередньо з GitHub' : 'Check for updates from GitHub'}</span>
                )}
              </div>

              {hasUpdate && latestRelease ? (
                <button
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    setIsUpdateModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-semibold transition cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadUpdate}</span>
                </button>
              ) : (
                <button
                  onClick={() => checkForUpdates(true)}
                  disabled={isChecking}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-hover hover:bg-theme-card text-theme-secondary hover:text-theme-primary border border-theme rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-theme-accent' : ''}`} />
                  <span>{isChecking ? t.checkingUpdates : t.checkForUpdates}</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Settings Shortcut */}
          <div className="pt-2 border-t border-theme flex items-center justify-between">
            <button
              onClick={() => {
                setIsSettingsModalOpen(false);
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-2 text-xs text-theme-accent hover:opacity-80 cursor-pointer font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.aiSettings} &rarr;</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-secondary border-t border-theme flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-5 py-2 bg-theme-accent hover:opacity-90 text-white rounded-xl text-sm font-medium transition cursor-pointer active:scale-95"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
