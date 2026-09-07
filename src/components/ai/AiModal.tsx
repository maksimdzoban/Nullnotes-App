import React, { useState } from 'react';
import { useAiStore } from '../../store/useAiStore';
import { useNotesStore } from '../../store/useNotesStore';
import { aiService } from '../../ai/aiService';
import type { Note } from '../../types';
import { X, Sparkles, FileText, Tag as TagIcon, RefreshCw, Copy, Check, Settings, ArrowDownToLine } from 'lucide-react';

interface AiModalProps {
  note: Note;
  onInsertSummary: (summaryText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AiModal: React.FC<AiModalProps> = ({ note, onInsertSummary, isOpen, onClose }) => {
  const { apiKey, model, setIsSettingsOpen } = useAiStore();
  const { updateNote, tags, createTag } = useNotesStore();

  const [activeTab, setActiveTab] = useState<'summarize' | 'tags'>('summarize');
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (isLoading) return;

    if (!apiKey) {
      setIsError(true);
      setStatusMessage('API-ключ не налаштовано. Відкрийте налаштування та додайте ключ OpenRouter.');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setStatusMessage('Генерується резюме нотатки...');

    const res = await aiService.summarizeNote(note.title, note.plainText || '');
    if (res.success && res.data) {
      setSummaryResult(res.data);
      setStatusMessage('');
    } else {
      setIsError(true);
      setStatusMessage(res.error || 'Не вдалося створити резюме');
    }
    setIsLoading(false);
  };

  const handleGenerateTags = async () => {
    if (isLoading) return;

    if (!apiKey) {
      setIsError(true);
      setStatusMessage('API-ключ не налаштовано. Відкрийте налаштування та додайте ключ OpenRouter.');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setStatusMessage('Аналіз тексту та підбір тегів...');

    const res = await aiService.generateTags(note.title, note.plainText || '');
    if (res.success && res.data) {
      setGeneratedTags(res.data);
      setStatusMessage('');
    } else {
      setIsError(true);
      setStatusMessage(res.error || 'Не вдалося підібрати теги');
    }
    setIsLoading(false);
  };

  const handleApplyTags = async () => {
    const existingTags = new Set(note.tags);
    const newTags = [...note.tags];

    for (const tag of generatedTags) {
      if (!existingTags.has(tag)) {
        newTags.push(tag);
        if (!tags.some(t => t.name === tag)) {
          await createTag(tag);
        }
      }
    }

    await updateNote(note.id, { tags: newTags });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-theme-card border border-theme rounded-2xl shadow-2xl overflow-hidden text-theme-primary">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-secondary">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-theme-accent-light text-theme-accent rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-theme-primary">AI Помічник</h2>
              <span className="text-[10px] text-theme-muted font-mono truncate max-w-[200px] block">
                {model.split('/').pop()?.split(':')[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Налаштування API ключа"
              className="p-1.5 text-theme-muted hover:text-theme-primary rounded-md transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-theme-muted hover:text-theme-primary rounded-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-theme bg-theme-secondary/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('summarize')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'summarize'
                ? 'border-theme-accent text-theme-accent'
                : 'border-transparent text-theme-muted hover:text-theme-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Резюме (Summarize)
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'tags'
                ? 'border-theme-accent text-theme-accent'
                : 'border-transparent text-theme-muted hover:text-theme-primary'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            Автотеги (Auto-tag)
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              isError
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                : 'bg-theme-accent-light border border-theme text-theme-accent'
            }`}>
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-theme-accent flex-shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === 'summarize' && (
            <div className="space-y-4">
              {!summaryResult && !isLoading && (
                <div className="text-center py-6 text-theme-muted space-y-3">
                  <p className="text-xs">
                    Створіть стисле резюме та головні тези нотатки <strong>"{note.title || 'Без назви'}"</strong>.
                  </p>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 py-2 px-4 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-medium transition shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Згенерувати резюме
                  </button>
                </div>
              )}

              {summaryResult && (
                <div className="space-y-3">
                  <div className="p-4 bg-theme-secondary border border-theme rounded-xl text-xs text-theme-primary leading-relaxed whitespace-pre-wrap">
                    {summaryResult}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-primary cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Спробувати ще раз
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-theme-hover hover:bg-theme-secondary text-theme-primary border border-theme rounded-lg text-xs transition cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Скопійовано' : 'Копіювати'}
                      </button>
                      <button
                        onClick={() => {
                          onInsertSummary(summaryResult);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-medium transition shadow-md cursor-pointer"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        Вставити в нотатку
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-4">
              {generatedTags.length === 0 && !isLoading && (
                <div className="text-center py-6 text-theme-muted space-y-3">
                  <p className="text-xs">
                    Штучний інтелект проаналізує тему та автоматично підбере ключові теги.
                  </p>
                  <button
                    onClick={handleGenerateTags}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 py-2 px-4 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-medium transition shadow-md cursor-pointer"
                  >
                    <TagIcon className="w-3.5 h-3.5" />
                    Підібрати теги
                  </button>
                </div>
              )}

              {generatedTags.length > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-theme-secondary border border-theme rounded-xl space-y-2">
                    <span className="text-[11px] text-theme-muted font-medium">Згенеровані теги:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {generatedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-theme-accent-light text-theme-accent border border-theme-accent"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleGenerateTags}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-primary cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Перегенерувати
                    </button>
                    <button
                      onClick={handleApplyTags}
                      className="flex items-center gap-1.5 py-1.5 px-4 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-medium transition shadow-md cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Додати теги до нотатки
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};