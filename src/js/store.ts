import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { booksApi } from './slices/booksApi';
import { bookSlice } from './slices/books';

export const store = configureStore({
  reducer: {
    [booksApi.reducerPath]: booksApi.reducer,
    book: bookSlice.reducer,
  },
  // reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(booksApi.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
