import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './constants';
import { BookListEntry, LanguageCode, chooseBook, type Book } from './books';

export { Book };

export interface RawBook {
  PAGES: RawBookPages;
  UI: Ui;
  STYLES: RawBookStyles;
}

export type RawBookPages = {
  [lang in LanguageCode]: RawBookPage[];
};

export interface RawBookPage {
  LINES: RawBookLine[];
  HOTSPOTS: RawBookHotspots;
}

export interface RawBookLine {
  WORDS: [string, number, number][];
  POS: number[];
}

export interface RawBookHotspots {
  [color: string]: [string, string][];
}

export interface Ui {
  PAGE_HOME: {
    BUTTONS: RawBookButtons;
    IMAGE: RawBookImage;
  };
  PAGE_GAMES: {
    BUTTONS: RawBookButtons;
    IMAGE: RawBookImage;
  };
  GAMES: unknown;
  PAGE_END: {
    BUTTONS: RawBookButtons;
    IMAGE: RawBookImage;
  };
}

export interface PageHome {
  BUTTONS: RawBookButtons;
  IMAGE: RawBookImage[];
}

export interface RawBookImage {
  FILENAME: string;
  POS: number[];
}

export interface RawBookButtons {
  [key: string]: {
    POS: number[];
  };
}

export interface RawBookStyles {
  UNREAD?: RawBookStyle;
  READING?: RawBookStyle;
  READ?: RawBookStyle;
}

export interface RawBookStyle {
  COLOR: string;
  SIZE: number;
  FONT: string;
}
// Define a service using a base URL and expected endpoints
export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<Array<BookListEntry>, void>({
      query: () => `index.json`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const data = await queryFulfilled;
        if (data.data.length === 1) {
          dispatch(chooseBook(data.data[0].id));
        }
      },
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
    getBookByURL: builder.query<RawBook, string>({
      query: (url) => url,
      transformResponse(response: RawBook) {
        console.log('getBookByURL.response', response);
        return response;
      },
    }),
  }),
});

export const { useGetBooksQuery, useGetBookByURLQuery, usePrefetch } = booksApi;
