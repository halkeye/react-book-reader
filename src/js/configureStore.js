import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';

const loggerMiddleware = createLogger();

// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const routerHistoryMiddleware = routerMiddleware(history);

export default function configureStore (preloadedState) {
  const middlewares = [thunkMiddleware, routerHistoryMiddleware];
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware);
  }
  return createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(...middlewares)
  );
}
