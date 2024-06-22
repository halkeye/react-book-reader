import { Suspense } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import App from './components/App';
import CircularProgress from '@mui/material/CircularProgress';

const Root = () => (
  <HelmetProvider>
    <Helmet>
      <title>Storybook Reader</title>
    </Helmet>
    <Suspense fallback={<CircularProgress color="inherit" size={16} />}>
      <App />
    </Suspense>
  </HelmetProvider>
);

export default Root;
