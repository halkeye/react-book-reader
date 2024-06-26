import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Button from '@mui/material/Button';
import { BookStyles } from '../models/Book';
import { useAtom } from 'jotai';
import { fontsAtom } from '../hooks/useFonts';

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
  const [state, setState] = useState('unread');
  const [fonts, setFonts] = useAtom(fontsAtom);

  const bookStyles = props.styles[state] || {};
  useEffect(() => {
    // Skip styles without fonts
    if (bookStyles.fontPath) {
      const { fontFamily, fontPath } = bookStyles;
      if (!fonts[fontFamily]) {
        // FIXME - this should be done when parsing not rendering
        setFonts({ ...fonts, [fontFamily]: fontPath });
      }
    }
  }, [fonts, setFonts, bookStyles]);

  useEffect(() => {
    if (
      props.start !== undefined &&
      props.end !== undefined &&
      props.audioTime !== undefined
    ) {
      if (props.audioTime > props.end) {
        setState('read');
      } else if (props.audioTime > props.start) {
        setState('reading');
      } else {
        setState('unread');
      }
    } else {
      setState('unread');
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
    if (props.styles[state]) {
      if (props.styles[state].color) {
        style.color = props.styles[state].color;
      }
      if (props.styles[state].fontFamily) {
        style.fontFamily = props.styles[state].fontFamily;
      }
      if (props.styles[state].fontSize) {
        style.fontSize = `${props.styles[state].fontSize}px`;
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
