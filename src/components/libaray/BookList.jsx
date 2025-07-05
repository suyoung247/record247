import useBookStore from '@/store/useBookStore';
import { useNavigate } from 'react-router-dom';

const BookList = () => {
  const { books, setCurrentBook } = useBookStore();
  const navigate = useNavigate();

  const handleSelect = (bookId) => {
    setCurrentBook(bookId);
    navigate('/viewer');
  };

  if (books.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        📭 업로드한 책이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3 mt-4">
      {books.map((book) => (
        <li
          key={book.bookId}
          onClick={() => handleSelect(book.bookId)}
          className="p-4 border rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
        >
          <p className="text-lg font-semibold truncate">{book.bookTitle}</p>
          <p className="text-sm text-gray-500">{book.bookId}</p>
        </li>
      ))}
    </ul>
  );
};

export default BookList;
