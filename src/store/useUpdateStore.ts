import { create } from 'zustand';
import { updateService, type ReleaseInfo, CURRENT_VERSION } from '../services/updateService';

interface UpdateState {
  currentVersion: string;
  isChecking: boolean;
  hasUpdate: boolean;
  latestRelease: ReleaseInfo | null;
  isUpdateModalOpen: boolean;
  lastCheckedAt: number | null;
  checkStatusMessage: string | null;

  setIsUpdateModalOpen: (open: boolean) => void;
  checkForUpdates: (manual?: boolean) => Promise<void>;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  currentVersion: CURRENT_VERSION,
  isChecking: false,
  hasUpdate: false,
  latestRelease: null,
  isUpdateModalOpen: false,
  lastCheckedAt: null,
  checkStatusMessage: null,

  setIsUpdateModalOpen: (open: boolean) => set({ isUpdateModalOpen: open }),

  checkForUpdates: async (manual = false) => {
    set({ isChecking: true, checkStatusMessage: null });
    try {
      const { hasUpdate, release } = await updateService.checkForUpdates();
      set({
        isChecking: false,
        hasUpdate,
        latestRelease: release,
        lastCheckedAt: Date.now(),
        checkStatusMessage: hasUpdate ? null : 'Встановлено найновішу версію'
      });

      if (hasUpdate && manual) {
        set({ isUpdateModalOpen: true });
      }
    } catch {
      set({
        isChecking: false,
        checkStatusMessage: 'Не вдалося перевірити оновлення'
      });
    }
  }
}));