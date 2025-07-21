import { v4 as uuidv4 } from 'uuid';
import { collection, getDocs } from 'firebase/firestore';
import { applyHighlight } from '@/utils/applyHighlight';
import { useHighlightStore } from '@/store/useHighlightStore';
import { firestoreDatabase } from '@/libs/firebase';

export function useSaveHighlight(rendition) {
  const store = useHighlightStore();

  if (!rendition) return { saveHighlight: null };

  const saveHighlight = async ({ id, cfi, text, color, memo, onClick }) => {
    if (!cfi || !text || !rendition) {
      console.warn('❗ 필수 값 누락: cfi, text, rendition 필요');
      return;
    }

    if (id) {
      store.updateHighlight(id, { color, memo, synced: false });
      const updated = store.highlights.find((highlight) => highlight.id === id);
      await applyHighlight(rendition, updated, onClick);
      return updated;
    }

    const existing = store.highlights.find(
      (highlight) => highlight.cfi === cfi && highlight.text === text
    );
    if (existing) return;

    const newHighlight = {
      id: uuidv4(),
      cfi,
      text,
      color,
      memo,
      createdAt: Date.now(),
      synced: false,
    };

    store.addHighlight(newHighlight);
    await applyHighlight(rendition, newHighlight, onClick);
    return newHighlight;
  };

  return { saveHighlight };
}

export async function fetchUserHighlights(uid) {
  const snap = await getDocs(
    collection(firestoreDatabase, `users/${uid}/highlights`)
  );
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ?? Date.now(),
    };
  });
}
