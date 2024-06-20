'use strict';
import { Helmet } from 'react-helmet-async';

import React, { ReactNode } from 'react';
import { useGetBooksQuery } from '../slices/books.ts';

// import '../../styles/main.scss';

/* Components */
import BookList from './BookList.jsx';
//
// import LanguageList from './LanguageList.tsx';
// import Book from './Book.jsx';
//
// /* Stores */
// import BookStore from '../stores/BookStore';
//
// /* Dispatchers */
//
// /* Constants */
// import Constants from '../constants/AppConstants';
//
// import AssetManager from '../AssetManager';
// import { BookListRecord } from '../reducers';
// import { Fonts } from '../hooks/useFonts';
// import { AppDispatch } from '../store.ts';

interface Props {
  // language: string;
  // bookName: string;
  // bookIconBig: string;
  // bookLanguages: Record<string, BookListRecord>;
  // books: Array<BookListRecord>;
  // book: BookListRecord | undefined;
  // page: string;
  // autoplay: string;
  // dispatch: AppDispatch;
}

interface State {
  assetsStarted: 0;
  assetsEnded: 0;
  fonts: Fonts;
}

export const PageBookSelector = () => {
  const { data: books, error, isLoading } = useGetBooksQuery();

  if (isLoading) {
    return <div>Loading Books...</div>;
  }

  if (error) {
    // FIXME - do something else
    throw error;
  }

  return (
    <>
      <Helmet>
        <title>Select a book</title>
      </Helmet>
      <div>
        <h1>Select a book</h1>
        <BookList books={books} />
      </div>
    </>
  );
};

export const App: React.FC<React.PropsWithChildren<Props>> = ({}) => {
  return <PageBookSelector />;
  /*

  const [state, setState] = React.useState<State>({
    assetsStarted: 0,
    assetsEnded: 0,
    fonts: {},
  });

  const selectLanguage = ({ bookLanguages }) => {
    if (bookLanguages == null) {
      return <div>Loading Language Choices...</div>;
    }
    return (
      <LanguageList
        iconBig={bookIconBig}
        languages={bookLanguages}
        dispatch={dispatch}
      />
    );
  };

  const selectBook = () => {
    if (!books) {
      return <div>Loading Books...</div>;
    }
    return (
      <>
        <Helmet>
          <title>Select a book</title>
        </Helmet>
        <div>
          <h1>Select a book</h1>
          <BookList books={books} dispatch={dispatch} />
        </div>
      </>
    );
  };

  const loadBook = (bookName, language) => {
    let key = ['book', bookName, 'lang', language].join('_');
    if (key !== state.loadingBook) {
      setState({ loadingBook: key });
      startAssetTracking();
      BookStore.getBook(bookName, language)
        .then((bookData) => {
          this.setState({ book: bookData });
        })
        .catch(function (ex) {
          console.log('error', ex);
        });
    }
  };

  const showPage = ({
    children,
    book,
    bookName,
    language,
    page,
    autoplay,
    dispatch,
  }) => {
    // const page = typeof page === 'object' ? 'home' : page;
    // autoplay = typeof autoplay === 'object' ? false : autoplay;
    if (!bookName) {
      return;
    }
    loadBook(bookName, language);

    if (book.id) {
      return (
        <Book
          dispatch={dispatch}
          book={book}
          language={language}
          page={page || 'home'}
          autoplay={autoplay || false}
        />
      );
    } else {
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
    }
  };

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

  React.useEffect(() => {
    dispatch(init());

    AppDispatcher.register((payload) => {
      let action = payload.action;

      switch (action.type) {
        case Constants.ActionTypes.ADD_FONT:
          let fonts = this.state.fonts || {};
          if (!fonts[action.fontFamily]) {
            fonts[action.fontFamily] = action.fontPath;
            this.setState({ fonts: fonts });
            this.updateFonts();
          }
          break;
        case Constants.ActionTypes.NAVIGATE_PAGE:
          const parts = console.log('parts', parts);
          if (parts.page === 0) {
            return null;
          }
          if (parts.page) {
            if (book.hasPage(parts.page)) {
              return dispatch(
                push(
                  '/book/' +
                    parts.book +
                    '/lang/' +
                    parts.language +
                    '/page/' +
                    parts.page +
                    (parts.autoplay ? '/autoplay' : '')
                )
              );
            } else if (!isNaN(parts.page)) {
              return dispatch(
                push(
                  '/book/' +
                    parts.book +
                    '/lang/' +
                    parts.language +
                    '/page/end' +
                    (parts.autoplay ? '/autoplay' : '')
                )
              );
            }
          } else if (parts.language) {
            return dispatch(
              push('/book/' + parts.book + '/lang/' + parts.language)
            );
          } else if (parts.book) {
            return dispatch(push('/book/' + parts.book));
          } else {
            return dispatch(push('/'));
          }
          console.log('payload', action.data, this.state.path.split('/'));
          break;
        // add more cases for other actionTypes...
      }
      return null;
    });
  }, []);

  if (book && language && page) {
    return showPage();
  }
  if (language) {
    return showPage();
  }
  if (bookName) {
    return selectLanguage();
  }
  return selectBook();
  */
};

// function mapStateToProps(state) {
//   const {
//     bookName,
//     language,
//     page,
//     autoplay,
//     books,
//     bookLanguages,
//     bookIconsBig,
//   } = state;
//
//   return {
//     language,
//     books,
//     bookName, // FIXME remove when fully removed old stores
//     bookIconBig: bookIconsBig[bookName],
//     bookLanguages: bookLanguages[bookName],
//     page,
//     autoplay,
//   };
// }
//
// export default connect(mapStateToProps)(App);
export default App;
