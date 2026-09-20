import { create } from 'zustand';

import type { DialogConfig } from './types';

interface DialogState {
  config: DialogConfig | null;
  hide: () => void;
  show: (config: DialogConfig) => void;
}

export const useDialogStore = create<DialogState>(set => ({
  config: null,
  hide: () => set({ config: null }),
  show: config => set({ config }),
}));
