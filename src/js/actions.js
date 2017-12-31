import { push } from 'react-router-redux';
export { push };

export const LOADING_BOOK = 'LOADING_BOOK';
export const LOADED_BOOK = 'LOADED_BOOK';
export const LOADED_BOOK_LIST_ITEM = 'LOADED_BOOK_LIST_ITEM';
export const ASSET_MANAGER_INCR_STARTED = 'ASSET_MANAGER_INCR_STARTED';
export const ASSET_MANAGER_INCR_SUCCESS = 'ASSET_MANAGER_INCR_SUCCESS';
export const ASSET_MANAGER_INCR_ERROR = 'ASSET_MANAGER_INCR_ERROR';
export const ASSET_MANAGER_RESET = 'ASSET_MANAGER_RESET';

const BookUtilities = require('./constants/BookUtilities.jsx');

export function init () {
  return dispatch => {
    dispatch(loadBooks());
  };
}

export function loadBooks () {
  return dispatch => {
    const baseUrl = 'https://books.saltystories.ca/';
    return dispatch({
      type: 'LOAD_BOOK_LIST_ITEMS',
      payload: {
        request: {
          url: baseUrl + 'books/index.json'
        }
      }
    })
      .then(json => {
        for (let book of json.data) {
          book.url = baseUrl + 'books/' + book.url;
          book.iconBig = baseUrl + 'books/' + (book.iconBig || book.icon);
          book.icon = baseUrl + 'books/' + book.icon;
          dispatch({
            type: 'LOADED_BOOK_LIST_ITEM',
            payload: book
          });
        }
      })
      .catch(function (ex) {
        console.log('parsing failed', ex);
        throw ex;
      });
  };
}
export function chooseAutoplay (autoPlay) {
  return (dispatch, getState) => {
    const state = getState();
    return dispatch(
      push(
        `/book/${state.bookName}/lang/${state.language}/page/${
          state.page
        }/${autoPlay}`
      )
    );
  };
}

export function choosePage (page) {
  return (dispatch, getState) => {
    const state = getState();
    return dispatch(
      push(`/book/${state.bookName}/lang/${state.language}/page/${page}`)
    );
  };
}

export function chooseLanguage (language) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(push(`/book/${state.bookName}/lang/${language}`));
    dispatch(loadBook(state.bookName, language));
  };
}

export function chooseBook (book) {
  return dispatch => {
    dispatch(push(`/book/${book.id}`));
  };
}

export function loadBook (bookName, language) {
  return (dispatch, getState) => {
    const state = getState();
    const book = state.books.find(b => b.id === bookName);
    const loadPromise = dispatch({
      type: LOADING_BOOK,
      payload: {
        request: {
          url: book.url
        },
        book: book
      }
    });
    return loadPromise
      .then(function (json) {
        let assetBaseUrl = BookUtilities.dirname(book.url);
        return {};
        return BookUtilities.processBookData(
          {},
          assetBaseUrl,
          json.data,
          language
        );
      })
      .then(function (book) {
        dispatch({
          type: LOADED_BOOK,
          payload: {
            book: book
          }
        });
      });
  };
}

export function assetDownloadStarted () {
  return {
    type: ASSET_MANAGER_INCR_STARTED,
    payload: {}
  };
}

export function assetDownloadError (asset) {
  return {
    type: ASSET_MANAGER_INCR_ERROR,
    payload: asset
  };
}

export function assetDownloadSuccess (asset) {
  return {
    type: ASSET_MANAGER_INCR_SUCCESS,
    payload: asset
  };
}
export function assetDownloadReset () {
  return {
    type: ASSET_MANAGER_RESET,
    payload: {}
  };
}
