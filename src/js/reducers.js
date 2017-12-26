import { combineReducers } from 'redux';

function book (state = {}, action) {
  if (action.type === 'blah') {
  }

  return state;
}

const rootReducer = combineReducers({
  book
});

export default rootReducer;
