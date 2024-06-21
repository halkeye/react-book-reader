import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { getQueryString } from '../hooks/useQueryString';
import { booksApi } from './booksApi';

export enum LanguageCode {
  EN = 'en',
  FR = 'fr',
}

export interface BooksState {
  bookCode: LanguageCode | undefined;
  chosenBookUrl: string | undefined;
  book: Book | undefined;
  books: Array<Book>;
  bookList: Array<BookListEntry>;
}

const getInitialState = (): BooksState => {
  const [query] = getQueryString();
  return {
    book: undefined,
    chosenBookUrl: undefined,
    bookCode: Object.values(LanguageCode).find(
      (code) => code === query.language
    ),
    books: [],
    bookList: [],
  };
};

export interface BookListEntry {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconBig: string;
  version: number;
  books: Array<string>;
}

export interface BookPage {}

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly pages?: Array<BookPage>;
}

export const bookSlice = createSlice({
  name: 'book',
  initialState: getInitialState(),
  reducers: {
    chosenBook: (state, action: PayloadAction<BookListEntry['id']>) => {
      const id = action.payload;
      const [query, setQuery] = getQueryString();

      console.log('chooseBook', id, { query, setQuery });
      setQuery('book', `${id}`);
      // TODO
      // 1) find book
      // 2) state.Book = {}
      // 3) trigger fetch
      state.chosenBookUrl = state.bookList?.find((book) => book.id === id)?.url;
    },
    chooseLanguage: (state, action: PayloadAction<LanguageCode>) => {
      if (!state.book) {
        throw new Error('Book is not loaded');
      }
      console.log('chooseLanguage', action.payload);
      state.book.pages = [];
      // FIXME - dispatch(push(`/book/${state.bookName}/lang/${book}`));
      // const something = state.book?.find((b) => b.id === action.payload);
    },
  },
  selectors: {
    bookList: (state) => state.bookList,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      booksApi.endpoints.getBooks.matchFulfilled,
      (state, action) => {
        state.bookList = action.payload;
        console.log('getBooksFulfilled', { state, action });
      }
    );
    // builder.addMatcher(
    //   booksApi.endpoints.getBookByURL.matchFulfilled,
    //   (state, action) => {
    //     const [query, setQuery] = getQueryString();
    //     console.log('action', action);
    //     state.book = action.payload;
    //     console.log('getBooksFulfilled', { state, action });
    //   }
    // );
  },
});

export const chooseBook = (id: Book['id']) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    console.log('action.chooseBook', id);

    const bookListBook = getState().book.bookList.find(
      (book) => book.id === id
    );
    if (!bookListBook) {
      throw new Error(`No such book ${id})`);
    }
    dispatch(bookSlice.actions.chosenBook(bookListBook.id));

    dispatch(booksApi.endpoints.getBookByURL.initiate(bookListBook.url));
  };
};

// Action creators are generated for each case reducer function
// export const { chooseLanguage } = bookSlice.actions;

export default bookSlice.reducer;
