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

function BookWord(props: Props) {
  const [state, setState] = useState(StyleDataState.READ);
  const addFont = useAddFont();

  useEffect(() => {
    const bookStyles = props.styles[state];
    // Skip styles without fonts
    if (bookStyles && bookStyles.fontFamily && bookStyles.fontPath) {
      const { fontFamily, fontPath } = bookStyles;
      addFont(fontFamily, fontPath);
    }
  }, [addFont, state, props.styles]);

  useEffect(() => {
    if (
      props.start !== undefined &&
      props.end !== undefined &&
      props.audioTime !== undefined
    ) {
      if (props.audioTime > props.end) {
        setState(StyleDataState.READ);
      } else if (props.audioTime > props.start) {
        setState(StyleDataState.READING);
      } else {
        setState(StyleDataState.UNREAD);
      }
    } else {
      setState(StyleDataState.UNREAD);
    }
  }, [props.audioTime, props.end, props.start, props]);

  const style = useMemo(() => {
    const style: CSSProperties = {
      cursor: 'pointer',
      backgroundColor: 'transparent',
      textTransform: 'none',
      padding: '4px',
      minWidth: 'initial',
      height: 'initial',
    };
    const stateSword = props.styles[state];
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
  }, [props.styles, state]);

  const onClick = useCallback(() => {
    props.onClick(props.word, props.audio);
  }, [props]);

  return (
    <Button style={style} onClick={onClick}>
      {` ${props.word}  `}
    </Button>
  );
}

export default BookWord;
