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
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Book as BookClass } from '../models/Book';
import { dirname } from '../constants/BookUtilities.js';
import { Screen } from './Screen.tsx';

const Book = () => {
  const [bookData] = useAtom(bookAtom);
  const [page] = useAtom(bookPageAtom);
  const [language] = useAtom(bookLanguageAtom);
  const [autoplay] = useAtom(bookAutoplayAtom);

  const book = useMemo(() => {
    if (!bookData || !language) {
      return null;
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

  const getPageTitle = useMemo(() => {
    if (!book) {
      return '';
    }

    // if numeric page number
    if (page && page.match(/^\d+/)) {
      return `${book.title} - ${page}`;
    }
    return book.title;
  }, [book, page]);

  if (!book || !page) {
    // it has to be something by here
    return null;
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
  let body = null;
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
    body = (
      <Screen key={`screen_${page}`} page={pageData} autoplay={autoplay} />
    );
  }
  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <link rel="shortcut icon" sizes="196x196" href={book.iconBig} />
      </Helmet>
      <div>{body}</div>
    </>
  );
};

export default Book;
