import { push } from 'react-router-redux';

require('whatwg-fetch'); // polyfill

export { push };

export const LOADED_BOOK_LIST_ITEM = 'LOADED_BOOK_LIST_ITEM';
export const ASSET_MANAGER_INCR_STARTED = 'ASSET_MANAGER_INCR_STARTED';
export const ASSET_MANAGER_INCR_SUCCESS = 'ASSET_MANAGER_INCR_SUCCESS';
export const ASSET_MANAGER_INCR_ERROR = 'ASSET_MANAGER_INCR_ERROR';
export const ASSET_MANAGER_RESET = 'ASSET_MANAGER_RESET';

const BookUtilities = require('./constants/BookUtilities.jsx');

export function init () {
  return dispatch => {
    const baseUrl = 'https://books.saltystories.ca/';
    fetch(baseUrl + 'books/index.json?_cacheBust=' + new Date().getTime())
      .then(response => response.json())
      .then(json => {
        for (let book of json) {
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
    const book = state.books.find(b => b.id === state.bookName);
    return fetch(book.url)
      .then(response => response.json())
      .then(json => {
        let assetBaseUrl = BookUtilities.dirname(book.url);
        return BookUtilities.processBookData(
          {},
          assetBaseUrl,
          json,
          language
        ).then(function (values) {
          dispatch({
            type: 'LOADED_BOOK',
            payload: {
              ...book,
              ...values[0]
            }
          });
        });
      });
  };
}

export function chooseBook (book) {
  return dispatch => {
    dispatch(push(`/book/${book.id}`));
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
