import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firestoreDatabase } from '@/libs/firebase';
import toast from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { useHighlightStore } from '@/store/useHighlightStore';

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
        throw new Error(
          '❌ 인증 정보와 UID가 일치하지 않음. Firestore 접근 차단됨'
        );
      }

      const path = COLLECTION_PATH(uid);
      await addDoc(collection(firestoreDatabase, path), {
        ...highlight,
        createdAt: serverTimestamp(),
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['highlights', uid]);
      toast.success('✅ 하이라이트 저장 완료');
    },
    onError: (error) => {
      console.error('❌ 하이라이트 저장 실패:', error);
      toast.error('하이라이트 저장 실패');
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
    },
    onError: (error) => {
      console.error('❌ 하이라이트 수정 실패:', error);
      toast.error('하이라이트 수정 실패');
    },
  });
}

export function useDeleteHighlight(uid) {
  const queryClient = useQueryClient();
  const { getHighlightCfiById, removeHighlight } = useHighlightStore.getState();

  return useMutation({
    mutationFn: async (highlightId) => {
      const docRef = doc(firestoreDatabase, COLLECTION_PATH(uid), highlightId);

      try {
        await deleteDoc(docRef);

        const deletedSnap = await getDoc(docRef, { source: 'server' });

        if (deletedSnap.exists()) {
          throw new Error('❌ Firestore 문서 삭제 실패: 여전히 존재함');
        }

        const cfi = getHighlightCfiById(highlightId);
        if (cfi && window._globalRendition) {
          window._globalRendition.annotations.remove(cfi, 'highlight');
          console.log('🧼 DOM 하이라이트 제거 완료:', cfi);
        }
      } catch (err) {
        console.error('🔥 삭제 처리 중 오류:', err.message);
        throw err;
      }
    },

    onSuccess: (_data, highlightId) => {
      removeHighlight(highlightId);
      queryClient.removeQueries(['highlights', uid]);
      queryClient.invalidateQueries(['highlights', uid]);
      toast.success('✅ 하이라이트 삭제 완료');
    },

    onError: (error) => {
      console.error('❌ 하이라이트 삭제 실패:', error);
      toast.error(`삭제 실패: ${error.message}`);
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
