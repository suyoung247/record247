import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firestoreDatabase } from '@/libs/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;
const USERS_COLLECTION = 'users';

export function useNote(uid) {
  return useQuery({
    queryKey: ['notes', uid],
    enabled: !!uid,
    queryFn: async () => {
      if (!uid) throw new Error('사용자 정보가 없습니다');
      const snapshot = await getDocs(
        collection(firestoreDatabase, `${USERS_COLLECTION}/${uid}/notes`)
      );
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    staleTime: FIVE_MINUTES,
    cacheTime: THIRTY_MINUTES,
  });
}

export function useAddNote(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content) => {
      if (!uid) throw new Error('로그인 후 시도해주세요.');
      await addDoc(
        collection(firestoreDatabase, `${USERS_COLLECTION}/${uid}/notes`),
        {
          content,
          createdAt: serverTimestamp(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', uid]);
      toast.success('메모 추가 성공');
    },
    onError: (error) => {
      console.error(error);
      toast.error('메모 추가 실패');
    },
  });
}

export function useDeleteNote(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      if (!uid) throw new Error('로그인 후 시도해주세요.');
      await deleteDoc(
        doc(firestoreDatabase, `${USERS_COLLECTION}/${uid}/notes/${id}`)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', uid]);
      toast.success('메모 삭제 성공');
    },
    onError: (error) => {
      console.error(error);
      toast.error('메모 삭제 실패');
    },
  });
}
