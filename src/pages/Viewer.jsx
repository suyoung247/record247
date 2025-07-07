import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EpubReaderWrapper from '@/components/epubViewer/EpubReaderWrapper';
import useBookStore from '@/store/useBookStore';
import toast from 'react-hot-toast';

const Viewer = () => {
  const navigate = useNavigate();
  const getCurrentBook = useBookStore((state) => state.getCurrentBook);
  const currentBook = getCurrentBook();

  useEffect(() => {
    if (!currentBook?.bookUrl) {
      toast.error('선택된 책이 없습니다. Intro로 이동합니다.');
      navigate('/intro');
    }
  }, [currentBook, navigate]);

  if (!currentBook?.bookUrl) return null;

  return (
    <div className="w-full h-screen">
      <EpubReaderWrapper book={currentBook} />
    </div>
  );
};

export default Viewer;
