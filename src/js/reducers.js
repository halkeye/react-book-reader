import { combineReducers } from 'redux';
import { routerReducer, LOCATION_CHANGE } from 'react-router-redux';
import { Record, List } from 'immutable';
import {
  LOADED_BOOK_LIST_ITEM,
  ASSET_MANAGER_INCR_LOADED,
  ASSET_MANAGER_INCR_TOTAL
} from './actions.js';

const BookListRecordClass = Record({
  id: '',
  title: '',
  url: '',
  icon: '',
  iconBig: '',
  version: 1,
  languages: []
});

export class BookListRecord extends BookListRecordClass {}

function assets (state = { total: null, loaded: null }, action) {
  if (action.type === ASSET_MANAGER_INCR_LOADED) {
    return { ...state, loaded: state.loaded + action.payload.loaded };
  }
  if (action.type === ASSET_MANAGER_INCR_TOTAL) {
    return { ...state, total: action.payload.total };
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
  if (action.type === LOADED_BOOK_LIST_ITEM) {
    return state.push(new BookListRecord(action.payload));
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
  /* Chosen state */
  language,
  page,
  autoPlay,
  bookName
});

export default rootReducer;
