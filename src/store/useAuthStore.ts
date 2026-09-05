import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  serverUrl: string;
  isAuthModalOpen: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setServerUrl: (url: string) => void;
  setIsAuthModalOpen: (open: boolean) => void;
}

const STORAGE_KEY_TOKEN = 'nullnotes_token';
const STORAGE_KEY_USER = 'nullnotes_user';
const STORAGE_KEY_SERVER_URL = 'nullnotes_server_url';

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  const userJson = localStorage.getItem(STORAGE_KEY_USER);
  const savedServerUrl = localStorage.getItem(STORAGE_KEY_SERVER_URL);

  let initialUser: User | null = null;
  try {
    if (userJson) initialUser = JSON.parse(userJson);
  } catch (e) {
    console.error('Failed to parse saved user:', e);
  }

  // Default server URL: host or fallback
  const defaultServerUrl = savedServerUrl || `${window.location.protocol}//${window.location.hostname}:3001`;

  return {
    user: initialUser,
    token: token || null,
    serverUrl: defaultServerUrl,
    isAuthModalOpen: false,

    setAuth: (user, token) => {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ user, token, isAuthModalOpen: false });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ user: null, token: null });
    },

    setServerUrl: (url) => {
      let cleanUrl = url.trim();
      if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
      localStorage.setItem(STORAGE_KEY_SERVER_URL, cleanUrl);
      set({ serverUrl: cleanUrl });
    },

    setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open })
  };
});