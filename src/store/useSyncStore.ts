import { create } from 'zustand';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;

  setStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (timestamp: number) => void;
  setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'offline',
  lastSyncedAt: null,
  error: null,

  setStatus: (status) => set({ status }),
  setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
  setError: (error) => set({ error })
}));