import { create } from 'zustand';

const useStore = create((set) => ({
  selectedText: '',
  isSettingsOpen: false,
  isModalOpen: false,
  setSelectedText: (text) => set({ selectedText: text }),
  clearSelectedText: () => set({ selectedText: '' }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  reset: () =>
    set({
      selectedText: '',
      isSettingsOpen: false,
      isModalOpen: false,
    }),
}));

export default useStore;
