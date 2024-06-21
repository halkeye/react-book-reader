import { useCallback } from 'react';
import Button from '@mui/material/Button';
import { Book, chooseBook } from '../slices/books';
import { useDispatch } from 'react-redux';

export const BookButton = ({
  id,
  title,
  icon,
}: {
  id: Book['id'];
  title: Book['title'];
  icon: Book['icon'];
}) => {
  const dispatch = useDispatch();
  const handleSelectBookClick = useCallback(
    () => dispatch(chooseBook(id)),
    [id, dispatch]
  );

  return (
    <Button onClick={handleSelectBookClick}>
      <img src={icon} />
      <span className="mui-raised-button-label">{title}</span>
    </Button>
  );
};

export default BookButton;
