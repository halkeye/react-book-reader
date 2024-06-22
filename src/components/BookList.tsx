import { useAtom } from 'jotai';
import { bookListAtom } from '../atoms.ts';
import BookButton from './BookButton.tsx';
import CircularProgress from '@mui/material/CircularProgress';

export const BookList = () => {
  const [books] = useAtom(bookListAtom);
  if (!books || books.length == 0) {
    return (
      <div>
        Loading
        <CircularProgress color="inherit" size={16} />
      </div>
    );
  }
  return (
    <>
      {books.map((book) => (
        <BookButton
          key={book.id}
          id={book.id}
          title={book.title}
          icon={book.icon}
        />
      ))}
    </>
  );
};

export default BookList;
