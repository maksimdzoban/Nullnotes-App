import React from 'react';
import { useThemeStore, type ThemeMode, type AccentColor } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAiStore } from '../../store/useAiStore';
import { 
  X, 
  Palette, 
  Globe, 
  Sparkles, 
  Check
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

  if (!isSettingsModalOpen) return null;

  const themes: { id: ThemeMode; name: string; desc: string; bgClass: string }[] = [
    { id: 'dark', name: t.themeDark, desc: 'Dark Graphite', bgClass: 'bg-slate-900 border-slate-700 text-slate-100' },
    { id: 'oled', name: t.themeOled, desc: 'Pure Black', bgClass: 'bg-black border-zinc-800 text-white' },
    { id: 'light', name: t.themeLight, desc: 'Clean White', bgClass: 'bg-white text-slate-900 border-slate-200' },
    { id: 'sepia', name: t.themeSepia, desc: 'Warm Paper', bgClass: 'bg-[#fbf0d9] text-[#433422] border-[#ebd8af]' }
  ];

  const accents: { id: AccentColor; name: string; colorClass: string }[] = [
    { id: 'indigo', name: t.accentIndigo, colorClass: 'bg-indigo-500' },
    { id: 'emerald', name: t.accentEmerald, colorClass: 'bg-emerald-500' },
    { id: 'amber', name: t.accentAmber, colorClass: 'bg-amber-500' },
    { id: 'rose', name: t.accentRose, colorClass: 'bg-rose-500' },
    { id: 'sky', name: t.accentSky, colorClass: 'bg-sky-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">{t.generalSettings}</h2>
              <p className="text-xs text-slate-400">{t.settings}</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-200">
          {/* Language Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t.language}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('uk')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  language === 'uk'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-indigo-400">UA</span>
                  <span className="text-sm font-medium">Українська</span>
                </div>
                {language === 'uk' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  language === 'en'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-indigo-400">EN</span>
                  <span className="text-sm font-medium">English</span>
                </div>
                {language === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t.theme}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => setTheme(tItem.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                    tItem.bgClass
                  } ${
                    theme === tItem.id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#12141c]' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold">{tItem.name}</div>
                    <div className="text-[11px] opacity-70">{tItem.desc}</div>
                  </div>
                  {theme === tItem.id && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">{t.accentColor}</h3>
            <div className="flex items-center gap-3">
              {accents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={`w-9 h-9 rounded-full ${a.colorClass} flex items-center justify-center transition cursor-pointer shadow-md ${
                    accent === a.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12141c] scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={a.name}
                >
                  {accent === a.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* AI Settings Shortcut */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <button
              onClick={() => {
                setIsSettingsModalOpen(false);
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.aiSettings} &rarr;</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
