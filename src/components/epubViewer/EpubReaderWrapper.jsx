import { useState, useRef, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import useBookStore from '@/store/useBookStore';

const EpubReaderWrapper = () => {
  const { getCurrentBook } = useBookStore();
  const currentBook = getCurrentBook();

  const [location, setLocation] = useState(null);
  const renditionRef = useRef(null);

  const handleLocationChange = (epubCfi) => {
    setLocation(epubCfi);
    localStorage.setItem(`cfi_${currentBook?.bookId}`, epubCfi);
  };

  useEffect(() => {
    if (currentBook?.bookId) {
      const savedCfi = localStorage.getItem(`cfi_${currentBook.bookId}`);
      if (savedCfi) setLocation(savedCfi);
    }
  }, [currentBook?.bookId]);

  if (!currentBook?.bookUrl) return <p>📭 EPUB 파일이 없습니다.</p>;

  return (
    <div style={{ height: '100vh' }}>
      <ReactReader
        url={currentBook.bookUrl}
        location={location}
        locationChanged={handleLocationChange}
        getRendition={(rendition) => (renditionRef.current = rendition)}
      />
    </div>
  );
};

export default EpubReaderWrapper;
