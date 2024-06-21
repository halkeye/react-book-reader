import { createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PayloadAction } from '@reduxjs/toolkit';

export enum LanguageCode {
  EN = 'en',
  FR = 'fr',
}

export interface BooksState {
  bookCode: LanguageCode | null;
  book: Book | null;
  books: Array<Book>;
}

const initialState: BooksState = {
  bookCode: null,
  books: [],
  book: null,
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
  readonly id: number;
  readonly title: string;
  readonly icon: string;
  readonly pages?: Array<BookPage>;
}

const BASE_URL = 'https://books.saltystories.ca/books/';
// Define a service using a base URL and expected endpoints
export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<Array<BookListEntry>, void>({
      query: () => `index.json`,
      transformResponse(response: Array<BookListEntry>) {
        return response.map((bookListEntry) => {
          return {
            ...bookListEntry,
            icon: new URL(bookListEntry.icon, BASE_URL).toString(),
            iconBig: new URL(bookListEntry.iconBig, BASE_URL).toString(),
            url: new URL(bookListEntry.url, BASE_URL).toString(),
          };
        });
      },
    }),
    getBookByURL: builder.query<Book, string>({
      query: (url) => url,
    }),
  }),
});

// auto-generated based on the defined endpoints
export const { useGetBooksQuery } = booksApi;

export const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    chooseBook: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      // TODO
      // 1) find book
      // 2) state.Book = {}
      // 3) trigger fetch
      state.book = state.books?.find((book) => book.id === id) ?? null;
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
  extraReducers: (builder) => {
    builder.addMatcher(
      booksApi.endpoints.getBooks.matchFulfilled,
      (state, action) => {
        console.log('getBooksFulfilled', { state, action });
      }
    );
  },
});

// Action creators are generated for each case reducer function
export const { chooseLanguage, chooseBook } = bookSlice.actions;

export default bookSlice.reducer;
