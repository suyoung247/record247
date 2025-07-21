import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { firestoreDatabase } from '@/libs/firebase';
import { useHighlightStore } from '@/store/useHighlightStore';

export async function cleanupHighlights(uid) {
  try {
    const localIds = useHighlightStore.getState().getAllHighlightIds();
    const snap = await getDocs(
      collection(firestoreDatabase, `users/${uid}/highlights`)
    );

    const deletions = [];

    snap.forEach((docSnap) => {
      if (!localIds.includes(docSnap.id)) {
        deletions.push(
          deleteDoc(
            doc(firestoreDatabase, `users/${uid}/highlights`, docSnap.id)
          )
        );
      }
    });

    if (deletions.length > 0) {
      await Promise.all(deletions);
    }
  } catch (err) {
    console.error('❌ 자동 삭제 실패:', err);
  }
}
