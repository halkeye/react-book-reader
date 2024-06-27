import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Button from '@mui/material/Button';
import { BookStyles, StyleDataState } from '../models/Book';
import { useAddFont } from '../hooks/useFonts';

interface Props {
  audio: string;
  audioTime?: number;
  end?: number;
  onClick: (word: string, audio: string) => void;
  start?: number;
  styles: BookStyles;
  word: string;
}

function BookWord(properties: Props) {
  const [state, setState] = useState(StyleDataState.READ);
  const addFont = useAddFont();

  useEffect(() => {
    const bookStyles = properties.styles[state];
    // Skip styles without fonts
    if (bookStyles && bookStyles.fontFamily && bookStyles.fontPath) {
      const { fontFamily, fontPath } = bookStyles;
      addFont(fontFamily, fontPath);
    }
  }, [addFont, state, properties.styles]);

  useEffect(() => {
    if (
      properties.start !== undefined &&
      properties.end !== undefined &&
      properties.audioTime !== undefined
    ) {
      if (properties.audioTime > properties.end) {
        setState(StyleDataState.READ);
      } else if (properties.audioTime > properties.start) {
        setState(StyleDataState.READING);
      } else {
        setState(StyleDataState.UNREAD);
      }
    } else {
      setState(StyleDataState.UNREAD);
    }
  }, [properties.audioTime, properties.end, properties.start, properties]);

  const style = useMemo(() => {
    const style: CSSProperties = {
      cursor: 'pointer',
      backgroundColor: 'transparent',
      textTransform: 'none',
      padding: '4px',
      minWidth: 'initial',
      height: 'initial',
    };
    const stateSword = properties.styles[state];
    if (stateSword) {
      if (stateSword.color) {
        style.color = stateSword.color;
      }
      if (stateSword.fontFamily) {
        style.fontFamily = stateSword.fontFamily;
      }
      if (stateSword.fontSize) {
        style.fontSize = `${stateSword.fontSize}px`;
      }
    }
    return style;
  }, [properties.styles, state]);

  const onClick = useCallback(() => {
    properties.onClick(properties.word, properties.audio);
  }, [properties]);

  return (
    <Button style={style} onClick={onClick}>
      {` ${properties.word}  `}
    </Button>
  );
}

export default BookWord;
