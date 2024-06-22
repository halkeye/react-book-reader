// import DocumentMeta from 'react-document-meta';
// import DocumentTitle from 'react-document-title';
// import Screen from './Screen.jsx';
// import GamePP from './GamePP.jsx';
// import GameFullMonty from './GameFullMonty.jsx';

import { useAtom } from 'jotai';
import { bookAtom, bookAutoplayAtom, bookPageAtom } from '../atoms.js';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

const Book = () => {
  const [book] = useAtom(bookAtom);
  const [page] = useAtom(bookPageAtom);
  const [autoplay] = useAtom(bookAutoplayAtom);

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

  if (!book) {
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
    let page = book.games[page];
    if (!page.gameName) {
      body = <h1>NO IDEA WHAT TO DO {page}</h1>;
    } else if (page.gameName === 'PP' || page.gameName === 'WP') {
      body = <GamePP key={'screen_' + page} page={page} mode={page.gameName} />;
    } else if (page.gameName === 'fullMonty') {
      body = <GameFullMonty key={'screen_' + page} page={page} />;
    }
  } else {
    let page = book.pages[page];
    body = <Screen key={'screen_' + page} page={page} autoplay={autoplay} />;
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
