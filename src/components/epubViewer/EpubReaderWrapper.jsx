import { useState, useEffect } from 'react';
import CustomEpubViewer from '@/components/epubViewer/CustomEpubViewer';

const EpubReaderWrapper = ({ book }) => {
  const [blobData, setBlobData] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(book.bookUrl);
      const blob = await res.blob();
      setBlobData(blob);
    };
    fetchBook();
  }, [book.bookUrl]);

  if (!blobData) return <p>📭 EPUB 불러오는 중...</p>;

  return (
    <div className="w-full h-full">
      <CustomEpubViewer blob={blobData} bookId={book.bookId} />
    </div>
  );
};

export default EpubReaderWrapper;
