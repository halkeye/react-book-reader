import { useCallback } from 'react';
import Button from '@mui/material/Button';
import { useAtom } from 'jotai';
import { bookIdAtom } from '../atoms';
import { Book } from '../models/Book';

const BookButton = ({
  id,
  title,
  icon,
}: {
  id: Book['id'];
  title: Book['title'];
  icon: Book['icon'];
}) => {
  const [, setBookId] = useAtom(bookIdAtom);
  const handleSelectBookClick = useCallback(
    () => setBookId(id),
    [id, setBookId]
  );

  return (
    <Button onClick={handleSelectBookClick}>
      <img src={icon} alt={`select ${title}`} />
      <span className="mui-raised-button-label">{title}</span>
    </Button>
  );
};

export default BookButton;
