import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSaveHighlight } from '@/utils/saveHighlight';
import { useDeleteHighlight } from '@/hooks/useHighlightSync';
import useStore from '@/store/useStore';

const COLORS = ['#facc15', '#86efac', '#a5b4fc', '#fda4af', '#f87171'];

const FloatingToolbar = ({ rendition }) => {
  const {
    toolbarState,
    setToolbarState,
    selectedText,
    clearSelectedText,
    openNoteModal,
    setHighlightColor,
    setActiveHighlightId,
  } = useStore();

  const { user } = useAuth();
  const { saveHighlight } = useSaveHighlight(rendition);
  const deleteHighlightMutation = useDeleteHighlight(user?.uid);

  const ref = useRef(null);

  useEffect(() => {
    if (!toolbarState || !ref.current) return;
    ref.current.style.top = `${toolbarState.top}px`;
    ref.current.style.left = `${toolbarState.left}px`;
  }, [toolbarState]);

  if (!toolbarState) return null;

  const isNew = !toolbarState.highlightId;

  const handleColorClick = async (color) => {
    if (!toolbarState?.cfi || !selectedText || !rendition) return;

    try {
      setHighlightColor(color);
      await saveHighlight({
        cfi: toolbarState.cfi,
        text: selectedText,
        color,
        memo: null,
      });
      setActiveHighlightId(null);
      clearSelectedText();
      setToolbarState(null);
    } catch (err) {
      console.error('💥 하이라이트 저장 실패:', err);
      alert('하이라이트 저장 중 문제가 발생했습니다.');
    }
  };

  const handleMemoClick = () => {
    const highlight = {
      id: toolbarState.highlightId ?? null,
      cfi: toolbarState.cfi,
      text: selectedText || '',
      color: toolbarState.color ?? '#facc15',
      createdAt: Date.now(),
      memo: '',
    };

    openNoteModal(highlight);

    setToolbarState({
      ...toolbarState,
      mode: 'note',
    });
  };

  const handleDelete = () => {
    if (!toolbarState.highlightId) return;
    deleteHighlightMutation.mutate(toolbarState.highlightId);
    clearSelectedText();
    setToolbarState(null);
  };

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white border border-gray-300 shadow-md rounded px-2 py-1 flex items-center space-x-2"
    >
      {isNew && !toolbarState.mode && (
        <>
          <button
            onClick={() => setToolbarState({ ...toolbarState, mode: 'color' })}
            className="text-sm px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded"
          >
            형광펜
          </button>
          <button
            onClick={handleMemoClick}
            className="text-sm px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
          >
            메모
          </button>
        </>
      )}

      {!isNew && !toolbarState.mode && (
        <>
          <button
            onClick={handleMemoClick}
            className="text-sm px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
          >
            메모 수정
          </button>
          <button
            onClick={() => setToolbarState({ ...toolbarState, mode: 'color' })}
            className="text-sm px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded"
          >
            색상
          </button>
          <button
            onClick={handleDelete}
            className="text-sm px-2 py-1 bg-red-100 hover:bg-red-200 rounded"
          >
            삭제
          </button>
        </>
      )}

      {toolbarState.mode === 'color' && (
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className="w-5 h-5 rounded-full border-2 hover:scale-110 transition"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
