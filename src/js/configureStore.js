import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
// import createHistory from 'history/createHashHistory';

import rootReducer from './reducers.js';

// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory();
const historyMiddleware = routerMiddleware(history);

const hasReduxDevToolsInstalled = !!(
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
);

const composeEnhancers = hasReduxDevToolsInstalled
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  : compose;
export default function configureStore (preloadedState) {
  const middleware = [thunkMiddleware, historyMiddleware];
  if (process.env.NODE_ENV === 'development') {
    if (!hasReduxDevToolsInstalled) {
      middleware.push(createLogger());
    }
  }
  return createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(...middleware))
  );
}
