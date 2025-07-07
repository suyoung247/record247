import { useEffect, useRef } from 'react';
import ePub from 'epubjs';

const CustomEpubViewer = ({ blob, bookId }) => {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);

  useEffect(() => {
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

    book.ready.then(() => {
      const savedCfi = localStorage.getItem(`cfi_${bookId}`);
      rendition.display(savedCfi || undefined);
    });

    rendition.on('relocated', (location) => {
      localStorage.setItem(`cfi_${bookId}`, location.start.cfi);
    });

    return () => {
      rendition.destroy();
      book.destroy();
    };
  }, [blob, bookId]);

  return <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />;
};

export default CustomEpubViewer;
