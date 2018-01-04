import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';
import { List, Map } from 'immutable';
import BookListItem from './models/BookListItem.js';
import {
  LOADED_BOOK_LIST_ITEM,
  ASSET_MANAGER_INCR_STARTED,
  ASSET_MANAGER_INCR_SUCCESS,
  ASSET_MANAGER_INCR_ERROR,
  ASSET_MANAGER_RESET
} from './actions.js';

function fonts (state = new Map(), action) {
  // fonts[action.fontFamily] = action.fontPath;
  return state;
}

function assets (state = { total: null, loaded: null }, action) {
  switch (action.type) {
    case ASSET_MANAGER_RESET:
      return { total: null, loaded: null };
    case ASSET_MANAGER_INCR_STARTED:
      return { ...state, total: (state.total || 0) + 1 };
    case ASSET_MANAGER_INCR_SUCCESS:
    case ASSET_MANAGER_INCR_ERROR:
      return { ...state, loaded: (state.loaded || 0) + 1 };
  }
  return state;
}

function bookLanguages (state = {}, action) {
  if (action.type === LOADED_BOOK_LIST_ITEM) {
    return { ...state, [action.payload.id]: action.payload.languages };
  }
  return state;
}

function bookIcons (state = {}, action) {
  if (action.type === LOADED_BOOK_LIST_ITEM) {
    return { ...state, [action.payload.id]: action.payload.icon };
  }
  return state;
}

function bookIconsBig (state = {}, action) {
  if (action.type === LOADED_BOOK_LIST_ITEM) {
    return { ...state, [action.payload.id]: action.payload.iconBig };
  }
  return state;
}

function bookUrls (state = {}, action) {
  if (action.type === LOADED_BOOK_LIST_ITEM) {
    return { ...state, [action.payload.id]: action.payload.url };
  }
  return state;
}

function books (state = List([]), action) {
  if (action.type === 'LOAD_BOOK_LIST_ITEMS_SUCCESS') {
    const baseUrl = action.meta.previousAction.payload.baseUrl;
    state = List([]);
    for (let book of action.payload.data) {
      book.url = baseUrl + 'books/' + book.url;
      book.iconBig = baseUrl + 'books/' + (book.iconBig || book.icon);
      book.icon = baseUrl + 'books/' + book.icon;
      state = state.push(new BookListItem(book));
    }
    return state;
  }
  return state;
}

function bookName (state = null, action) {
  if (action.type === LOCATION_CHANGE) {
    return action.payload.pathname.split('/')[2] || null;
  }
  return state;
}

function language (state = null, action) {
  if (action.type === LOCATION_CHANGE) {
    return action.payload.pathname.split('/')[4] || null;
  }
  return state;
}

function page (state = null, action) {
  if (action.type === LOCATION_CHANGE) {
    return action.payload.pathname.split('/')[6] || null;
  }
  return state;
}

function autoPlay (state = null, action) {
  if (action.type === LOCATION_CHANGE) {
    return action.payload.pathname.split('/')[7] || null;
  }
  return state;
}

const rootReducer = combineReducers({
  router: routerReducer,
  assets,
  /* Data */
  bookLanguages,
  bookIcons,
  bookIconsBig,
  bookUrls,
  books,
  fonts,
  /* Chosen state */
  language,
  page,
  autoPlay,
  bookName
});

export default rootReducer;
