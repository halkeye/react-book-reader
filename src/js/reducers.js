import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { LOCATION_CHANGE } from 'react-router-redux/es/reducer';

function books (state = null, action) {
  if (action.type === 'LOADED_BOOK') {
    return (state || []).concat(action.payload.book);
  }
  return state;
}

function bookName (state = null, action) {
  if (action.type === LOCATION_CHANGE) {
    console.log('a', action.payload.pathname.split('/'));
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
  books,
  language,
  page,
  autoPlay,
  bookName
});

export default rootReducer;
