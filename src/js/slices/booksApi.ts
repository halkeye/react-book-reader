import {
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './constants';
import { BookListEntry, type Book } from './books';

export { Book };

// Define a service using a base URL and expected endpoints
export const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<Array<BookListEntry>, void>({
      // selectBook: builder.query<BookListEntry, string>({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        console.log('selectBook', {
          id,
          api,
          extraOptions,
          baseQuery,
          booksApi,
          state: api.getState(),
        });
        const response = await baseQuery('index.json');
        if (response.error) {
          return { error: response.error as FetchBaseQueryError };
        }

        const bookData = {
          data: (response.data as Array<BookListEntry>).map((bookListEntry) => {
            return {
              ...bookListEntry,
              icon: new URL(bookListEntry.icon, BASE_URL).toString(),
              iconBig: new URL(bookListEntry.iconBig, BASE_URL).toString(),
              url: new URL(bookListEntry.url, BASE_URL).toString(),
            };
          }),
        };
        console.log(
          'isOnlyOne?',
          bookData && bookData.data && bookData.data.length == 1
        );
        if (bookData && bookData.data && bookData.data.length == 1) {
          api.dispatch(
            booksApi.endpoints.getBookByURL.initiate(bookData.data[0].url)
          );
          // api.dispatch(.getBookByURL(bookData.data[0].id)
        }
        return bookData;
      },
      // }),
      // getBooks: builder.query<Array<BookListEntry>, void>({
      //   query: () => `index.json`,
      // onQueryStarted - https://stackoverflow.com/questions/76725183/dispatch-action-when-createapi-query-is-completed
      // transformResponse(response: Array<BookListEntry>) {
      //   return response.map((bookListEntry) => {
      //     return {
      //       ...bookListEntry,
      //       icon: new URL(bookListEntry.icon, BASE_URL).toString(),
      //       iconBig: new URL(bookListEntry.iconBig, BASE_URL).toString(),
      //       url: new URL(bookListEntry.url, BASE_URL).toString(),
      //     };
      //   });
      // },
    }),
    getBookByURL: builder.query<Book, string>({
      query: (url) => url,
      transformResponse(response: Book) {
        console.log('getBookByURL.response', response);
        return response;
      },
    }),
  }),
});

export const { useGetBooksQuery, useGetBookByURLQuery, usePrefetch } = booksApi;
