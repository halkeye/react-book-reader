/* eslint-env jest */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import {
  assetDownloadSuccess,
  assetDownloadError,
  assetDownloadStarted,
  assetDownloadReset,
  loadBooks,
  loadBook,
  LOADING_BOOK,
  LOADED_BOOK,
  ASSET_MANAGER_INCR_STARTED,
  ASSET_MANAGER_INCR_SUCCESS,
  ASSET_MANAGER_INCR_ERROR,
  ASSET_MANAGER_RESET
} from './actions.js';

const client = axios.create({ responseType: 'json' });

describe('actions', function () {
  it('assetDownloadSuccess', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadSuccess({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_SUCCESS }
    ]);
  });
  it('assetDownloadError', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadError({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_ERROR }
    ]);
  });
  it('assetDownloadStarted', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadStarted({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_STARTED }
    ]);
  });
  it('assetDownloaReset', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadReset());
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_RESET }
    ]);
  });
  it('loadBooks', async () => {
    const store = configureMockStore([thunk, axiosMiddleware(client)])();
    await store.dispatch(loadBooks());
    const actions = store.getActions().map(action => {
      delete action.payload.config;
      delete action.payload.request;
      delete action.payload.headers;
      return action;
    });
    expect(actions).toEqual([
      {
        payload: {
          request: {
            url: 'https://books.saltystories.ca/books/index.json'
          }
        },
        type: 'LOAD_BOOK_LIST_ITEMS'
      }
    ]);
  });
  it('loadBook', async () => {
    const book = {
      id: 'josephine',
      url: 'https://books.saltystories.ca/books/Josephine/BookData.json'
    };
    const store = configureMockStore([thunk, axiosMiddleware(client)])({
      books: [book]
    });
    await store.dispatch(loadBook('josephine', 'en'));
    const actions = store.getActions().map(action => {
      delete action.payload.config;
      delete action.payload.request;
      delete action.payload.headers;
      console.log('action', action);
      return action;
    });

    expect(actions).toEqual([
      { payload: book, type: LOADING_BOOK, $payload: { url: book.url } },
      { payload: {}, type: LOADED_BOOK }
    ]);
  });
});
