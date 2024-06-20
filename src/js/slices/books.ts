import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dirname, processBookData } from '../constants/BookUtilities';
import { BookListRecord } from '../reducers';

export enum LanguageCode {
  EN = 'en',
  FR = 'fr',
}

export interface LanguageState {
  languageCode: LanguageCode | null;
}

const initialState: LanguageState = {
  languageCode: null,
};

export interface BookListEntry {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconBig: string;
  version: number;
  languages: Array<string>;
}

export interface Book {}

// Define a service using a base URL and expected endpoints
export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://books.saltystories.ca/books/',
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<BookListRecord, string>({
      query: () => `index.json`,
    }),
    getBookByURL: builder.query<Book, string>({
      query: (url) => url,
    }),
  }),
});

// auto-generated based on the defined endpoints
export const { useGetBooksQuery } = booksApi;

// First, create the thunk
const fetchBookByURL = createAsyncThunk(
  'book/fetchByURLStatus',
  async (language: string, url: string, thunkAPI) => {
    const bookJSON = await fetch(url).then((response) => response.json());
    const assetBaseUrl = dirname(url);
    // existing book
    const existingBookData = {};
    // state.books.find((b) => b.id === state.bookName) || {};
    const loadedBookData = await processBookData(
      {},
      assetBaseUrl,
      bookJSON,
      language
    );

    return {
      ...existingBookData,
      ...loadedBookData,
    };
  }
);

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    chooseLanguage: (state) => {
      // FIXME - dispatch(push(`/book/${state.bookName}/lang/${language}`));
      const book = state.books.find((b) => b.id === state.bookName);
    },
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { chooseLanguage } = languageSlice.actions;

export default languageSlice.reducer;
