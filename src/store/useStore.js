import { create } from 'zustand';

const useStore = create((set) => ({
  selectedText: '',
  setSelectedText: (text) => set({ selectedText: text }),
  clearSelectedText: () => set({ selectedText: '' }),

  toolbarState: null,
  setToolbarState: (state) => set({ toolbarState: state }),
  clearToolbarState: () => set({ toolbarState: null }),

  activeHighlightId: null,
  setActiveHighlightId: (id) => set({ activeHighlightId: id }),

  highlightColor: null,
  setHighlightColor: (color) => set({ highlightColor: color }),

  isNoteModalOpen: false,
  selectedHighlight: null,
  openNoteModal: (highlight) =>
    set({
      isNoteModalOpen: true,
      selectedHighlight: highlight,
    }),
  closeNoteModal: () =>
    set({
      isNoteModalOpen: false,
      selectedHighlight: null,
    }),

  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  isModalOpen: false,
  noteModal: null,
  openNoteModalDialog: (note) => set({ noteModal: note, isModalOpen: true }),
  closeModal: () => set({ noteModal: null, isModalOpen: false }),

  selectedNote: null,

  reset: () =>
    set({
      selectedText: '',
      selectedNote: null,
      toolbarState: null,
      activeHighlightId: null,
      highlightColor: null,
      isNoteModalOpen: false,
      selectedHighlight: null,
      isSettingsOpen: false,
      isModalOpen: false,
      noteModal: null,
    }),
}));

export default useStore;
