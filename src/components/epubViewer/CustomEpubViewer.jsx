import { useEffect, useRef } from 'react';
import ePub from 'epubjs';
import useStore from '@/store/useStore';
import FloatingToolbar from '@/components/epubViewer/FloatingToolbar';
import { extractCfiFromSelection } from '@/utils/extractCfiFromSelection';
import { fetchUserHighlights } from '@/utils/saveHighlight';
import { applyHighlight } from '@/utils/applyHighlight';
import { useAuth } from '@/hooks/useAuth';
import NoteModal from '@/components/readingNote/NoteModal';
import { useSaveHighlight } from '@/utils/saveHighlight';
import { useUpdateHighlight } from '@/hooks/useHighlightSync';

const CustomEpubViewer = ({ blob, bookId }) => {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);

  const { user } = useAuth();
  const { saveHighlight } = useSaveHighlight(renditionRef.current);
  const updateMemo = useUpdateHighlight(user?.uid);

  const {
    setSelectedText,
    clearSelectedText,
    setToolbarState,
    isNoteModalOpen,
    selectedHighlight,
    closeNoteModal,
    toolbarState,
  } = useStore();

  useEffect(() => {
    const init = async () => {
      if (!blob || !viewerRef.current) return;

      const book = ePub(blob);
      bookRef.current = book;

      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        manager: 'default',
        flow: 'paginated',
      });

      renditionRef.current = rendition;
      window._globalRendition = rendition;

      await book.ready;

      function handleHighlightClick(highlight) {
        setToolbarState({
          top: 100,
          left: 100,
          cfi: highlight.cfi,
          highlightId: highlight.id,
          mode: null,
          type: 'click',
        });
        setSelectedText(highlight.text);
      }

      if (user?.uid) {
        try {
          const highlights = await fetchUserHighlights(user.uid);
          for (const h of highlights) {
            if (!h.cfi) continue;
            await applyHighlight(rendition, h, handleHighlightClick);
          }
        } catch (error) {
          console.error('❌ 하이라이트 불러오기 실패:', error);
        }
      }

      const savedCfi = localStorage.getItem(`cfi_${bookId}`);
      await rendition.display(savedCfi || undefined);

      rendition.on('relocated', (location) => {
        localStorage.setItem(`cfi_${bookId}`, location.start.cfi);
      });

      rendition.on('rendered', () => {
        const contents = rendition.getContents();

        contents.forEach((content) => {
          const doc = content.document;
          if (!doc) return;

          const win = content.window;

          doc.addEventListener('mouseup', async () => {
            const selection = win.getSelection();
            const selectedText = selection.toString().trim();

            if (!selectedText) {
              clearSelectedText();
              setToolbarState(null);
              return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const top = rect.top - 40 + win.scrollY;
            const left = rect.left + rect.width / 2 + win.scrollX;

            const cfi = extractCfiFromSelection(range, content);
            if (!cfi) return;

            setSelectedText(selectedText);
            setToolbarState({
              top,
              left,
              cfi,
              highlightId: null,
              mode: null,
            });
          });
        });
      });
    };

    init();

    return () => {
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
    };
  }, [blob, bookId, setSelectedText, clearSelectedText, setToolbarState, user]);

  return (
    <div
      ref={viewerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <FloatingToolbar rendition={renditionRef.current} />
      {isNoteModalOpen &&
        selectedHighlight &&
        toolbarState?.mode === 'note' && (
          <NoteModal
            visible={isNoteModalOpen}
            highlightInfo={selectedHighlight}
            onClose={closeNoteModal}
            onSave={(memo) => {
              if (!selectedHighlight) return;

              const isNew = !selectedHighlight.id;

              if (isNew) {
                saveHighlight({
                  ...selectedHighlight,
                  memo,
                });
              } else {
                updateMemo.mutate({
                  id: selectedHighlight.id,
                  update: { memo },
                });
              }

              closeNoteModal();
              setToolbarState(null);
              clearSelectedText();
            }}
            position={toolbarState}
          />
        )}
    </div>
  );
};

export default CustomEpubViewer;
