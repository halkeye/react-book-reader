import { push } from 'react-router-redux';

require('whatwg-fetch'); // polyfill

export { push };

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
            type: 'LOADED_BOOK',
            payload: {
              book
            }
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
    return dispatch(push(`/book/${state.bookName}/lang/${state.language}/page/${state.page}/${autoPlay}`));
  };
}

export function choosePage (page) {
  return (dispatch, getState) => {
    const state = getState();
    return dispatch(push(`/book/${state.bookName}/lang/${state.language}/page/${page}`));
  };
}

export function chooseLanguage (language) {
  return (dispatch, getState) => {
    const state = getState();
    return dispatch(push(`/book/${state.bookName}/lang/${language}`));
  };
}

export function chooseBook (bookName) {
  return dispatch => {
    return dispatch(push(`/book/${bookName}`));
  };
}
