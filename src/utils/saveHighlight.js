import { v4 as uuidv4 } from 'uuid';
import { applyHighlight } from './applyHighlight';
import { useHighlightStore } from '@/store/useHighlightStore';
import { useAddHighlight } from '@/hooks/useHighlightSync';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs } from 'firebase/firestore';
import { firestoreDatabase } from '@/libs/firebase';

export function useSaveHighlight(rendition) {
  const { addHighlight } = useHighlightStore();
  const { user } = useAuth();
  const addHighlightMutation = useAddHighlight(user?.uid);

  const saveHighlight = async ({ cfi, text, color, memo }) => {
    if (!cfi || !text || !rendition) {
      console.warn('❗ 필수 값 누락: cfi, text, rendition 필요');
      return;
    }

    const id = uuidv4();

    const localHighlight = {
      id,
      cfi,
      text,
      color,
      memo,
      createdAt: Date.now(),
      synced: false,
    };

    addHighlight(localHighlight);
    await applyHighlight(rendition, localHighlight, null);

    if (user?.uid) {
      addHighlightMutation.mutate({
        ...localHighlight,
        synced: true,
      });
    }

    return localHighlight;
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
