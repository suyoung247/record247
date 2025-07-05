import { create } from 'zustand';

const useBookStore = create((set, get) => ({
  books: [],
  bookMap: {},
  currentBookId: null,

  setBooks: (newBooks) => {
    const bookMap = {};
    newBooks.forEach((book) => {
      bookMap[book.bookId] = book;
    });

    localStorage.setItem('books', JSON.stringify(newBooks));
    localStorage.setItem('bookMap', JSON.stringify(bookMap));

    set({ books: newBooks, bookMap });
  },

  addBook: (book) => {
    const { books } = get();
    const newBooks = [...books, book];

    const newBookMap = {
      ...get().bookMap,
      [book.bookId]: book,
    };

    localStorage.setItem('books', JSON.stringify(newBooks));
    localStorage.setItem('bookMap', JSON.stringify(newBookMap));
    localStorage.setItem('currentBookId', book.bookId);

    set({
      books: newBooks,
      bookMap: newBookMap,
      currentBookId: book.bookId,
    });
  },

  setCurrentBookId: (bookId) => {
    localStorage.setItem('currentBookId', bookId);
    set({ currentBookId: bookId });
  },

  getCurrentBook: () => {
    const { bookMap, currentBookId } = get();
    return bookMap[currentBookId] || null;
  },

  resetBooks: () => {
    localStorage.removeItem('books');
    localStorage.removeItem('bookMap');
    localStorage.removeItem('currentBookId');
    set({ books: [], bookMap: {}, currentBookId: null });
  },
}));

export default useBookStore;
