import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../styles/main.css';

// Stores
import { bookAtom, bookLanguageAtom } from '../atoms.ts';
import Book from './Book.tsx';

// Hooks
import { useAtom } from 'jotai';
import { useFonts } from '../hooks/useFonts.ts';

/* Components */
import BookList from './BookList.jsx';
import LanguageList from './LanguageList.tsx';

// interface State {
//   assetsStarted: 0;
//   assetsEnded: 0;
//   fonts: Fonts;
// }
//

export const App = () => {
  const [book] = useAtom(bookAtom);
  const [bookLanguage] = useAtom(bookLanguageAtom);

  useFonts();

  if (!book) {
    return <BookList />;
  }

  if (!bookLanguage) {
    return <LanguageList />;
  }

  if (book) {
    return <Book />;
  }

  /*

  const [state, setState] = React.useState<State>({
    assetsStarted: 0,
    assetsEnded: 0,
    fonts: {},
  });

    let percent = 0;
    if (assetsStarted && assetsEnded) {
      percent = (assetsEnded / assetsStarted) * 100;
    }

    let style = {
      width: Math.max(0, Math.min(percent, 100)) + '%',
      transition: 'width 200ms',
    };

    return (
      <div className="progressbar-container">
        <div className="progressbar-progress" style={style}>
          {children}
        </div>
      </div>
    );

  const onAssetStarted = (_asset) => {
    setState((prev) => {
      return { started: prev.started + 1 };
    });
  };

  const onAssetEnded = (_asset) => {
    setState((prev) => {
      return { ended: prev.ended + 1 };
    });
  };

  const onAssetError = (asset, _path) => {
    // FIXME - need to handle something here
    console.log('error', asset);
  };

  const startAssetTracking = () => {
    setState({ ended: 0, started: 0 });

    AssetManager.on('started', () => dispatch(assetDownloadStarted()));
    AssetManager.on('error', (asset) => dispatch(assetDownloadError(asset)));
    AssetManager.on('ended', (asset) => dispatch(assetDownloadSuccess(asset)));
  };
  */
};
export default App;
