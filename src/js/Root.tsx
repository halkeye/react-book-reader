import { Provider } from 'react-redux';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { store } from './store';
import App from './components/App';

// FIMXE - redux router
// return (<ConnectedRouter history={history}>{ret}</ConnectedRouter>)

const Root = () => (
  <HelmetProvider>
    <Provider store={store}>
      <Helmet>
        <title>Storybook Reader</title>
      </Helmet>
      <App />
    </Provider>
  </HelmetProvider>
);

export default Root;
