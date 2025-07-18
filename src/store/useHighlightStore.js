import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export const useHighlightStore = create(
  persist(
    (set, get) => ({
      highlights: [],

      addHighlight: ({ id = uuidv4(), cfi, text, color = '#facc15', memo }) => {
        const newHighlight = {
          id,
          cfi,
          text,
          color,
          memo,
          createdAt: Date.now(),
          synced: false,
        };

        set((state) => ({
          highlights: [...state.highlights, newHighlight],
        }));

        return newHighlight;
      },

      getHighlightCfiById: (id) => {
        const state = get();
        const found = state.highlights.find((h) => h.id === id);
        return found?.cfi || null;
      },

      removeHighlight: (id) => {
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        }));
      },

      markAsSynced: (ids) => {
        set((state) => ({
          highlights: state.highlights.map((h) =>
            ids.includes(h.id) ? { ...h, synced: true } : h
          ),
        }));
      },

      updateHighlight: (id, updatedFields) => {
        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === id ? { ...h, ...updatedFields } : h
          ),
        }));
      },

      setHighlights: (highlightList) => {
        set({ highlights: highlightList });
      },
    }),

    {
      name: 'epub-highlights',
    }
  )
);
