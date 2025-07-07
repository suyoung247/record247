import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEpubFile } from '@/utils/epubUtils';
import useBookStore from '@/store/useBookStore';
import { useAuth } from '@/hooks/useAuth';
import { uploadEpubToServer } from '@/utils/epubUploader';

const UploadBox = () => {
  const inputRef = useRef();
  const navigate = useNavigate();
  const addBook = useBookStore((state) => state.addBook);
  const { user } = useAuth();

  const handleFile = async (file) => {
    if (!file || !user) return;

    const isFrontendValid = await isValidEpubFile(file);
    if (!isFrontendValid) {
      return;
    }

    const serverUploadResult = await uploadEpubToServer(file, user.uid);

    if (!serverUploadResult.success || !serverUploadResult.url) {
      return;
    }

    const bookTitle = file.name.replace('.epub', '');
    const bookId = `${user.uid}-${Date.now()}`;
    const bookUrl = serverUploadResult.url;
    const createdAt = Date.now();

    const newBook = { bookId, bookTitle, bookUrl, createdAt };
    addBook(newBook);

    localStorage.setItem('books', JSON.stringify([newBook]));
    navigate('/viewer');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      className="border-2 border-dashed border-gray-400 rounded-md p-8 text-center"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="text-lg font-semibold mb-2">파일을 이곳에 드래그하세요</p>
      <p
        className="text-blue-600 cursor-pointer underline mb-4"
        onClick={() => inputRef.current.click()}
      >
        또는 파일 선택
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".epub"
        onChange={handleInput}
        className="hidden"
      />

      <p className="text-sm text-gray-500 mt-2">
        EPUB 파일을 업로드하여 독서를 시작하세요.
      </p>
    </div>
  );
};

export default UploadBox;
