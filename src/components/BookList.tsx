import { useAtom } from 'jotai';
import { bookListAtom } from '../atoms.ts';
import BookButton from './BookButton.tsx';
import CircularProgress from '@mui/material/CircularProgress';
import { Helmet } from 'react-helmet-async';

export const BookList = () => {
  const [books] = useAtom(bookListAtom);
  const title = 'Select a book';

  if (!books || books.length === 0) {
    return (
      <div>
        Loading
        <CircularProgress color="inherit" size={16} />
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div>
        <h1>{title}</h1>
        {books.map((book) => (
          <BookButton
            key={book.id}
            id={book.id}
            title={book.title}
            icon={book.icon}
          />
        ))}
      </div>
    </>
  );
};

export default BookList;
