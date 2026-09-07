import React, { useState, useEffect } from 'react';
import { useAiStore } from '../../store/useAiStore';
import { aiService } from '../../ai/aiService';
import { X, Sparkles, Key, CheckCircle, AlertTriangle, ExternalLink, Trash2, RefreshCw, Search } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  category: 'free' | 'popular' | 'all';
}

const DEFAULT_FEATURED_MODELS: ModelOption[] = [
  { id: 'openrouter/free', name: '⚡ OpenRouter: Free Models Router (Автоматичний безкоштовний)', category: 'free' },
  { id: 'openrouter/auto', name: '🔄 OpenRouter: Auto Router (Найкраща доступна модель)', category: 'popular' },
  { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Google: Gemini 2.0 Flash Lite (Free)', category: 'free' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google: Gemma 4 31B (Free)', category: 'free' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek: DeepSeek V3 (Ультрадешево / Топ)', category: 'popular' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o Mini (Швидко & Точно)', category: 'popular' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Anthropic: Claude 3.5 Haiku', category: 'popular' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet (Максимальна якість)', category: 'popular' },
];

export const AiSettingsModal: React.FC = () => {
  const { apiKey, model, isSettingsOpen, setApiKey, setModel, clearApiKey, setIsSettingsOpen } = useAiStore();

  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState(model);
  const [valStatus, setValStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [allModels, setAllModels] = useState<ModelOption[]>(DEFAULT_FEATURED_MODELS);
  const [modelFilter, setModelFilter] = useState<'free' | 'popular' | 'all'>('free');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isSettingsOpen) {
      setInputKey(apiKey);
      setSelectedModel(model);
      fetchRemoteModels();
    }
  }, [isSettingsOpen]);

  const fetchRemoteModels = async () => {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      if (res.ok) {
        const data = await res.json();
        const modelsList: ModelOption[] = [
          { id: 'openrouter/free', name: '⚡ OpenRouter: Free Models Router (Безкоштовний пул)', category: 'free' },
          { id: 'openrouter/auto', name: '🔄 OpenRouter: Auto Router (Автоматичний вибір)', category: 'popular' },
          ...data.data.map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            category: (m.id.includes(':free') || m.id === 'openrouter/free' || m.pricing?.prompt === '0') ? 'free' : 'popular'
          }))
        ];
        setAllModels(modelsList);
      }
    } catch (e) {
      // Keep default featured models on offline/error
    }
  };

  if (!isSettingsOpen) return null;

  const handleValidate = async () => {
    setIsValidating(true);
    setValStatus(null);
    const result = await aiService.validateKey(inputKey);
    setValStatus({ message: result.message, isError: !result.valid });
    setIsValidating(false);
  };

  const handleSave = () => {
    setApiKey(inputKey);
    setModel(selectedModel);
    setIsSettingsOpen(false);
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setValStatus(null);
  };

  const filteredModels = allModels.filter((m) => {
    const matchesFilter = modelFilter === 'all' || (modelFilter === 'free' ? m.category === 'free' : true);
    const matchesSearch = !searchQuery.trim() || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-theme-card border border-theme rounded-2xl shadow-2xl overflow-hidden text-theme-primary">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-secondary">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-theme-accent-light text-theme-accent rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-theme-primary">Налаштування AI (OpenRouter)</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 text-theme-muted hover:text-theme-primary rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Security Notice */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-2.5 text-xs text-amber-500">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1">
              <p className="font-medium">Безпека вашого ключа (BYOK)</p>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Ключ зберігається лише локально у вашому браузері/пристрої та надсилається напряму до OpenRouter.
              </p>
            </div>
          </div>

          {/* Model Selection & Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-theme-secondary">Модель штучного інтелекту</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setModelFilter('free')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    modelFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-theme-muted hover:text-theme-primary'
                  }`}
                >
                  Лише Free
                </button>
                <button
                  type="button"
                  onClick={() => setModelFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    modelFilter === 'all' ? 'bg-theme-accent-light text-theme-accent border border-theme' : 'text-theme-muted hover:text-theme-primary'
                  }`}
                >
                  Всі ({allModels.length})
                </button>
              </div>
            </div>

            {/* Search Filter for models */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук моделі (напр: free, gpt, claude, gemini)..."
                className="w-full bg-theme-input border border-theme rounded-lg pl-8 pr-3 py-1.5 text-xs text-theme-primary outline-none focus:border-theme-accent transition"
              />
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-theme-input border border-theme rounded-lg px-3 py-2 text-xs text-theme-primary outline-none focus:border-theme-accent transition font-mono truncate"
            >
              {!filteredModels.some(m => m.id === selectedModel) && (
                <option value={selectedModel} className="bg-theme-card text-theme-primary font-sans">
                  {selectedModel} (Обрана модель)
                </option>
              )}

              {filteredModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-theme-card text-theme-primary font-sans">
                  {m.category === 'free' ? '🎁 ' : '⚡ '} {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-theme-secondary">OpenRouter API Key</label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-theme-accent hover:opacity-80 transition"
              >
                Отримати безкоштовно <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setValStatus(null);
                }}
                placeholder="sk-or-v1-..."
                className="w-full bg-theme-input border border-theme rounded-lg pl-9 pr-3 py-2 text-xs text-theme-primary outline-none focus:border-theme-accent transition font-mono"
              />
            </div>
          </div>

          {/* Validation Status message */}
          {valStatus && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              valStatus.isError ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            }`}>
              {valStatus.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || !inputKey.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-theme-hover hover:bg-theme-card disabled:opacity-50 text-theme-primary border border-theme rounded-lg text-xs font-medium transition cursor-pointer"
            >
              {isValidating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-theme-accent" />}
              Перевірити ключ
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                title="Очистити збережений ключ"
                className="p-2 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 px-3 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-semibold transition shadow-md cursor-pointer"
            >
              Зберегти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};