import { create } from 'zustand';

const useStore = create((set) => ({
  selectedText: '',
  selectedNote: null,
  isSettingsOpen: false,
  isModalOpen: false,
  noteModal: null,

  setSelectedText: (text) => set({ selectedText: text }),
  clearSelectedText: () => set({ selectedText: '' }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  openNoteModal: (note) => set({ noteModal: note, isModalOpen: true }),
  closeModal: () => set({ noteModal: null, isModalOpen: false }),

  reset: () =>
    set({
      selectedText: '',
      selectedNote: null,
      isSettingsOpen: false,
      isModalOpen: false,
      noteModal: null,
    }),

  highlightColor: null,
  setHighlightColor: (color) => set({ highlightColor: color }),
}));

export default useStore;
