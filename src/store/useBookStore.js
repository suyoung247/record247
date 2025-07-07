import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookStore = create(
  persist(
    (set, get) => ({
      books: [],
      bookMap: {},
      currentBookId: null,

      setBooks: (newBooks) => {
        const bookMap = {};
        newBooks.forEach((book) => {
          bookMap[book.bookId] = book;
        });

        set({ books: newBooks, bookMap });
      },

      addBook: (book) => {
        const { books, bookMap } = get();
        const newBooks = [...books, book];
        const newBookMap = { ...bookMap, [book.bookId]: book };

        set({
          books: newBooks,
          bookMap: newBookMap,
          currentBookId: book.bookId,
        });
      },

      setCurrentBookId: (bookId) => {
        set({ currentBookId: bookId });
      },

      getCurrentBook: () => {
        const { bookMap, currentBookId } = get();
        return bookMap[currentBookId] || null;
      },

      resetBooks: () => {
        set({ books: [], bookMap: {}, currentBookId: null });
      },
    }),
    {
      name: 'book-store',
    }
  )
);

export default useBookStore;
