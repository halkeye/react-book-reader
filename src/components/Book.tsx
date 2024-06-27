// import DocumentMeta from 'react-document-meta';
// import DocumentTitle from 'react-document-title';
// import GamePP from './GamePP.jsx';
// import GameFullMonty from './GameFullMonty.jsx';

import { useAtom } from 'jotai';
import {
  LanguageCode,
  bookAtom,
  bookAutoplayAtom,
  bookLanguageAtom,
  bookPageAtom,
} from '../atoms.js';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Book as BookClass } from '../models/Book';
import { dirname } from '../constants/BookUtilities.js';
import Screen from './Screen.tsx';
import CircularProgress from '@mui/material/CircularProgress';

const Book = () => {
  const [bookData] = useAtom(bookAtom);
  const [page] = useAtom(bookPageAtom);
  const [language] = useAtom(bookLanguageAtom);
  const [bookLoaded, setBookLoaded] = useState(false);

  const book = useMemo(() => {
    if (!bookData || !language) {
      return;
    }

    return new BookClass(
      bookData.id,
      bookData.title,
      bookData.icon,
      dirname(bookData.url),
      bookData,
      language as LanguageCode
    );
  }, [bookData, language]);

  useEffect(() => {
    if (book) {
      book
        .finishLoading()
        .then(() => {
          setBookLoaded(true);
          return;
        })
        .catch(() => {
          alert('error loading book');
        });
    } else {
      setBookLoaded(false);
    }
  }, [book]);

  const pageTitle = useMemo(() => {
    if (!book) {
      return '';
    }

    // if numeric page number
    if (page && /^\d+/.test(page)) {
      return `${book.title} - ${page}`;
    }
    return book.title;
  }, [book, page]);

  if (!book || !page) {
    // it has to be something by here
    return false;
  }

  if (!bookLoaded) {
    // FIXME - switch to loading bar
    return (
      <div>
        Loading
        <CircularProgress color="inherit" size={16} />
      </div>
    );
  }

  // <Screen book={book} language={language} page={page} />
  /* if (isNaN(page))
  {
    return (
      <div><Page key={'page_' + page} book={book} language={language} page={page} /></div>
    );
  }
  else
  {
    page = parseInt(page,10);
    return (
      <div><BookPage key={'page_' + page} book={book} language={language} page={page} autoplay={autoplay} /></div>
    );
  } */
  let body: ReactElement;
  if (book.hasGame(page)) {
    const pageData = book.games[page];
    if (!pageData.gameName) {
      body = <h1>NO IDEA WHAT TO DO {JSON.stringify(page)}</h1>;
    } else if (pageData.gameName === 'PP' || pageData.gameName === 'WP') {
      body = (
        <GamePP
          key={`screen_${page}`}
          page={pageData}
          mode={pageData.gameName}
        />
      );
    } else if (pageData.gameName === 'fullMonty') {
      body = <GameFullMonty key={`screen_${page}`} page={pageData} />;
    }
  } else {
    const pageData = book.pages[page];
    body = <Screen key={`screen_${page}`} page={pageData} />;
  }
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="shortcut icon" sizes="196x196" href={book.icon} />
      </Helmet>
      <div>{body}</div>
    </>
  );
};

export default Book;
