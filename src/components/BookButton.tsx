import { useCallback } from 'react';
import Button from '@mui/material/Button';
import { useAtom } from 'jotai';
import { Book, bookIdAtom } from '../atoms';

export const BookButton = ({
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
      <img src={icon} />
      <span className="mui-raised-button-label">{title}</span>
    </Button>
  );
};

export default BookButton;
