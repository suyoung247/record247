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

      setHighlights: (incomingList) => {
        set((state) => {
          const existingMap = new Map(state.highlights.map((h) => [h.id, h]));

          incomingList.forEach((h) => {
            existingMap.set(h.id, h);
          });

          return {
            highlights: Array.from(existingMap.values()),
          };
        });
      },

      getAllHighlightIds: () => {
        const state = get();
        return state.highlights.map((h) => h.id);
      },

      getHighlightById: (id) => get().highlights.find((h) => h.id === id),
    }),

    {
      name: 'epub-highlights',
    }
  )
);
