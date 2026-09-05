import { create } from 'zustand';

export interface AiSettings {
  apiKey: string;
  provider: 'openrouter';
  model: string;
}

interface AiState {
  apiKey: string;
  provider: 'openrouter';
  model: string;
  isSettingsOpen: boolean;
  isAiModalOpen: boolean;

  // Actions
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  clearApiKey: () => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsAiModalOpen: (open: boolean) => void;
}

const STORAGE_KEY_AI_KEY = 'nullnotes_ai_key_v1';
const STORAGE_KEY_AI_MODEL = 'nullnotes_ai_model_v1';

// Default model for OpenRouter: fast, reliable, inexpensive/free tier
const DEFAULT_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

export const useAiStore = create<AiState>((set) => {
  const savedKey = localStorage.getItem(STORAGE_KEY_AI_KEY) || '';
  const savedModel = localStorage.getItem(STORAGE_KEY_AI_MODEL) || DEFAULT_MODEL;

  return {
    apiKey: savedKey,
    provider: 'openrouter',
    model: savedModel,
    isSettingsOpen: false,
    isAiModalOpen: false,

    setApiKey: (key: string) => {
      const trimmed = key.trim();
      localStorage.setItem(STORAGE_KEY_AI_KEY, trimmed);
      set({ apiKey: trimmed });
    },

    setModel: (model: string) => {
      localStorage.setItem(STORAGE_KEY_AI_MODEL, model);
      set({ model });
    },

    clearApiKey: () => {
      localStorage.removeItem(STORAGE_KEY_AI_KEY);
      set({ apiKey: '' });
    },

    setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setIsAiModalOpen: (open) => set({ isAiModalOpen: open })
  };
});