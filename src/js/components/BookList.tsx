import { useDispatch } from 'react-redux';
import { Book, chooseBook } from '../slices/books';
import BookButton from './BookButton.tsx';

interface Props {
  books: Array<Book>;
}

export const BookList = ({ books }: Props) => {
  const dispatch = useDispatch();

  // if (books.length === 1) {
  //   dispatch(chooseBook(books[0].id));
  //   return <div>Auto selecting book</div>;
  // }

  return (
    <>
      {books.map((book) => (
        <BookButton key={book.id} id={book.id} title={book.title} icon={book.icon} />
      ))}
    </>
  );
};

export default BookList;
