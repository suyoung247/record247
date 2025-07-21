import { useEffect, useRef } from 'react';
import { useHighlightStore } from '@/store/useHighlightStore';
import { useAddHighlight } from '@/hooks/useHighlightSync';
import toast from 'react-hot-toast';

export function useAutoHighlightSync(uid) {
  const { highlights, markAsSynced } = useHighlightStore();
  const saveMutation = useAddHighlight(uid);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsynced = highlights.filter((highlight) => !highlight.synced);
    if (unsynced.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await Promise.all(
          unsynced.map((highlight) => {
            const { synced, ...cleaned } = highlight;
            return saveMutation.mutateAsync(cleaned);
          })
        );
        const ids = unsynced.map((highlight) => highlight.id);
        markAsSynced(ids);
      } catch (err) {
        toast.error(
          '하이라이트 자동 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
      }
    }, 5000);
  }, [highlights]);
}
