import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { firestoreDatabase } from '@/libs/firebase';
import { useHighlightStore } from '@/store/useHighlightStore';
import toast from 'react-hot-toast';

const COLLECTION_PATH = (uid) => `users/${uid}/highlights`;

const FIVE_MIN = 1000 * 60 * 5;
const CACHE = 1000 * 60 * 30;

export function useHighlights(uid) {
  return useQuery({
    queryKey: ['highlights', uid],
    enabled: !!uid,
    queryFn: async () => {
      const snap = await getDocs(
        collection(firestoreDatabase, COLLECTION_PATH(uid))
      );
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    staleTime: FIVE_MIN,
    cacheTime: CACHE,
  });
}

export function useAddHighlight(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (highlight) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const currentUid = currentUser?.uid;

      if (!currentUid || currentUid !== uid) {
        throw new Error('인증된 사용자와 UID가 일치하지 않습니다.');
      }

      const path = COLLECTION_PATH(uid);
      const highlightRef = doc(firestoreDatabase, path, highlight.id);

      await setDoc(highlightRef, {
        ...highlight,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['highlights', uid]);
      toast.success('하이라이트가 저장되었습니다.');
    },
    onError: () => {
      toast.error('하이라이트 저장 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });
}

export function useUpdateHighlight(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, update }) => {
      const ref = doc(firestoreDatabase, COLLECTION_PATH(uid), id);
      await updateDoc(ref, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['highlights', uid]);
      toast.success('하이라이트가 수정되었습니다.');
    },
    onError: () => {
      toast.error(
        '하이라이트 업데이트 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    },
  });
}

export function useDeleteHighlight(uid) {
  const queryClient = useQueryClient();
  const { getHighlightCfiById, removeHighlight } = useHighlightStore.getState();

  return useMutation({
    mutationFn: async (highlightId) => {
      const docRef = doc(firestoreDatabase, COLLECTION_PATH(uid), highlightId);

      await deleteDoc(docRef);
      const deletedSnap = await getDoc(docRef, { source: 'server' });

      if (deletedSnap.exists()) {
        throw new Error('Firestore 문서가 정상적으로 삭제되지 않았습니다.');
      }

      const cfi = getHighlightCfiById(highlightId);
      if (cfi && window._globalRendition) {
        window._globalRendition.annotations.remove(cfi, 'highlight');
      }
    },
    onSuccess: (_data, highlightId) => {
      removeHighlight(highlightId);
      queryClient.removeQueries(['highlights', uid]);
      queryClient.invalidateQueries(['highlights', uid]);
      toast.success('하이라이트가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('하이라이트 삭제 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });
}

export function useSaveHighlightMemo() {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const add = useAddHighlight(uid);
  const update = useUpdateHighlight(uid);

  const saveMemo = (highlight) => {
    if (!uid) {
      toast.error('로그인이 필요합니다.');
      throw new Error('로그인 필요');
    }

    if (highlight.id) {
      return update.mutate({
        id: highlight.id,
        update: {
          memo: highlight.memo || '',
        },
      });
    } else {
      return add.mutate(highlight);
    }
  };

  return { saveMemo };
}
