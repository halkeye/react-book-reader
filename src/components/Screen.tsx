import IconButton from '@mui/material/IconButton';
import { useAtom } from 'jotai';
import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import AssetManager from '../AssetManager.ts';
import { LanguageCode, bookAutoplayAtom, bookPageAtom } from '../atoms.ts';
import Constants from '../constants/AppConstants.js';
import useSwipe from '../hooks/useSwipe.ts';
import { Book, BookHotspot, BookImage, BookPage } from '../models/Book.ts';
import BookAudio from '../models/BookAudio.jsx';
import BookHotspotMap from './BookHotspotMap.tsx';
import BookHotspotPhrase from './BookHotspotPhrase.tsx';
import BookWord from './BookWord.tsx';
import ImageButton from './ImageButton.tsx';

const clickThreshold = 5;

interface Props {
  page: BookPage;
  book: Book;
  language: LanguageCode;
  children: React.ReactNode;
}

function ScreenImageButton({
  image,
  assetManager,
  onButtonClick,
}: {
  image: BookImage;
  assetManager: AssetManager;
  onButtonClick: (page: string) => void;
}) {
  const onClick = useCallback(() => {
    if (image.nextPage) {
      onButtonClick(image.nextPage);
    }
  }, [image, onButtonClick]);

  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${image.top}%`,
    left: `${image.left}%`,
    width: `${image.width}%`,
    height: `${image.height}%`,
  };
  if (image.nextPage) {
    style.border = 'none';
    style.backgroundSize = 'contain';
    style.backgroundColor = 'rgba(0,0,0,0.0)';
    style.backgroundImage = `url(${assetManager.getAssetSrc(image.image)})`;
    return (
      <IconButton
        key={`button_${image.nextPage}`}
        style={style}
        onClick={onClick}
      />
    );
  }
  return (
    <img
      key={`button_${image.image}`}
      style={style}
      src={assetManager.getAssetSrc(image.image)}
    />
  );
}

export function Screen(props: Props) {
  const [, setBookPage] = useAtom(bookPageAtom);
  const [autoplay, setAutoplay] = useAtom(bookAutoplayAtom);
  const [audioTime, setAudioTime] = useState<number>(0);
  const [playButton, setPlayButton] = useState<string>('play');
  const audioRef = useRef<BookAudio | null>(null);
  const hotspotPhraseRef = useRef<typeof BookHotspotPhrase | null>(null);
  const hotspotMapRef = createRef<BookHotspotMap>();

  const pagePrev = () => {
    const pageNum = parseInt(props.page.id, 10);
    if (isNaN(pageNum)) {
      return;
    }
    setBookPage((pageNum - 1).toString());
  };

  const pageNext = () => {
    const pageNum = parseInt(props.page.id, 10);
    if (isNaN(pageNum)) {
      return;
    }
    setBookPage((pageNum + 1).toString());
  };

  const onSwipedLeft = () => {
    pageNext();
  };

  const onSwipedRight = () => {
    pagePrev();
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft,
    onSwipedRight,
  });

  const restartState = () => {
    setAudioTime(0);
    setPlayButton('play');
  };

  const onNewPage = useCallback(() => {
    audioRef.current?.stop();
    restartState();
    if (autoplay && props.page.audio) {
      audioRef.current?.play('page', props.page.audio);
    }
  }, [audioRef, autoplay, props.page.audio]);

  useEffect(() => {
    const audio = new BookAudio(props.page.assetManager);
    audio.bind('page', 'play', onPagePlay);
    audio.bind('page', 'pause', onPagePause);
    audio.bind('page', 'ended', onPageEnded);
    audio.bind('page', 'timeupdate', onPageTime);
    audioRef.current = audio;

    // FIXME
    // bindShortcut('left', pagePrev);
    // bindShortcut('right', pageNext);

    onNewPage();

    return () => {
      audioRef.current?.removeAll();
      // unbindShortcut('left');
      // unbindShortcut('right');
    };
  }, [props.page.assetManager, onNewPage]);

  useEffect(() => {
    props.page && onNewPage();
  }, [props.page, onNewPage]);

  const getPageStyle = () => {
    const ret: React.CSSProperties = {
      position: 'relative',
      width: `${getPageWidth()}px`,
      height: `${getPageHeight()}px`,
    };
    if (props.page.image) {
      ret.backgroundSize = 'contain';
      ret.backgroundImage = `url(${props.page.assetManager.getAssetSrc(props.page.image)})`;
    }
    return ret;
  };

  const onPagePlay = () => {
    setPlayButton('pause');
  };

  const onPagePause = () => {
    setPlayButton('play');
  };

  const onPageEnded = () => {
    setPlayButton('play');
  };

  const onPageTime = (time: number) => {
    if (time) {
      setAudioTime(time);
    }
  };

  const hasPlayButton = () => {
    return !!props.page.audio;
  };

  const getPageHeight = (): number => {
    return Constants.Dimensions.HEIGHT;
    /*
    let dom = this.bookpage.getDOMNode();
    return dom.offsetHeight || dom.clientHeight;
    */
  };

  const getPageWidth = (): number => {
    return Constants.Dimensions.WIDTH;
    /*
    let dom = this.bookpage.getDOMNode();
    return dom.offsetWidth || dom.clientWidth;
    */
  };

  const onHotspot = (hotspot: BookHotspot, x: number, y: number) => {
    setAudioTime(0);
    if (audioRef.current) {
      audioRef.current.stop();
    }
    if (hotspotPhraseRef.current) {
      hotspotPhraseRef.current.triggerAnimation(hotspot.text, x, y);
    }
    if (audioRef.current) {
      audioRef.current.play('hotspot', hotspot.audio);
    }
  };

  const onBackButtonClick = () => {
    // FIXME
    // setBookPage(props.page.back);
  };
  const onHomeButtonClick = () => {
    setBookPage('');
    setAutoplay(false);
  };

  const onButtonClick = (page: string) => {
    if (page === 'read' || page === 'readAudio') {
      setBookPage('1');
      return;
    }
    setBookPage(page);
  };

  const hasHomeButton = () => {
    return props.page.id !== 'home';
  };

  const hasBackButton = () => {
    return hasHomeButton() && 'back' in props.page;
  };

  const onWordClick = (_word: string, audio: string) => {
    setAudioTime(0);
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.play('word', audio);
    }
  };

  const onPlayPauseButtonClick = () => {
    if (playButton === 'play') {
      if (audioRef.current) {
        audioRef.current.play('page', props.page.audio);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const onClickPage = (/* ev: Event */) => {
    alert('onClickpage');
    // if (this.hotspotMap) {
    //   const x = ev.pageX - ev.currentTarget.offsetLeft;
    //   const y = ev.pageY - ev.currentTarget.offsetTop;
    //   if (this.hotspotMap.onClickImage(x, y)) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //   }
    // }
  };

  const key = [
    'book',
    props.book,
    'language',
    props.language,
    'page',
    props.page,
  ].join('_');

  const extraImages = props.page.images.map((image, idx) => (
    <ScreenImageButton
      key={idx}
      image={image}
      onButtonClick={onButtonClick}
      assetManager={props.page.assetManager}
    />
  ));

  const extraLines = props.page.lines.map((line, lineIdx) => {
    const words = line.words.map((word, wordIdx) => {
      return (
        <BookWord
          key={`word${wordIdx}`}
          audioTime={audioTime}
          {...word}
          onClick={onWordClick}
        />
      );
    });

    const style: React.CSSProperties = {
      position: 'absolute',
      top: `${line.top}%`,
      left: `${line.left}%`,
    };
    return (
      <div key={`line${lineIdx}`} style={style}>
        {words}
      </div>
    );
  });

  let homeBackButton;
  if (hasBackButton()) {
    homeBackButton = (
      <ImageButton
        key="homeButton"
        top="0"
        left="0"
        assetManager={props.page.assetManager}
        image={'buttons/control_back.png'}
        onClick={onBackButtonClick}
      />
    );
  } else {
    homeBackButton = (
      <ImageButton
        key="backButton"
        top="0"
        left="0"
        assetManager={props.page.assetManager}
        image={'buttons/control_home.png'}
        enabled={hasHomeButton()}
        onClick={onHomeButtonClick}
      />
    );
  }

  return (
    <div style={getPageStyle()} {...swipeHandlers} onClick={onClickPage}>
      <BookHotspotMap
        ref={hotspotMapRef}
        {...props.page.hotspot}
        assetManager={props.page.assetManager}
        height={getPageHeight()}
        width={getPageWidth()}
        onHotspot={onHotspot}
      />
      <BookHotspotPhrase
        phrase={'word'}
        x={1}
        y={1}
        {...props.page.styles.unread}
      />
      <div
        style={{
          top: 0,
          left: 0,
          position: 'absolute',
          height: '100%',
          width: `${clickThreshold}%`,
        }}
        onClick={pagePrev}
      />
      <div
        style={{
          top: 0,
          right: 0,
          position: 'absolute',
          height: '100%',
          width: `${clickThreshold}%`,
        }}
        onClick={pageNext}
      />
      {homeBackButton}
      <ImageButton
        key="playPauseButton"
        top="0"
        right="0"
        assetManager={props.page.assetManager}
        image={`buttons/control_${playButton}.png`}
        enabled={hasPlayButton()}
        onClick={onPlayPauseButtonClick}
      />
      {extraImages}
      {extraLines}
      {props.children}
    </div>
  );
}

export default Screen;
/*
class Screen extends React.Component<Props, State> {
  static initialProps = {
    styles: {},
  };

  restartState() {
    return {
      audioTime: 0,
      playButton: 'play',
    };
  }

  constructor(props: Props) {
    super(props);
    this.setState(this.restartState());
  }

  componentWillUnmount() {
    this.state.audio.removeAll();
    // this.unbindShortcut('left');
    // this.unbindShortcut('right');
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.page !== nextProps.page) {
      this.onNewPage(nextProps);
    }
  }

  onNewPage(props) {
    this.state.audio.stop();
    this.setState(this.restartState(), () => {
      if (props.autoplay && props.page.pageAudio) {
        this.state.audio.play('page', props.page.pageAudio);
      }
    });
  }

  getPageStyle() {
    const ret: React.CSSProperties = {
      position: 'relative',
      width: `${this.getPageWidth()}px`,
      height: `${this.getPageHeight()}px`,
    };
    if (this.props.page.image) {
      ret.backgroundSize = 'contain';
      ret.backgroundImage = `url(${this.props.page.assetManager.getAssetSrc(
        this.props.page.image
      )})`;
    }
    return ret;
  }

  onClickPage(ev) {
    if (this.hotspotMap) {
      const x = ev.pageX - ev.currentTarget.offsetLeft;
      const y = ev.pageY - ev.currentTarget.offsetTop;
      if (this.hotspotMap.onClickImage(x, y)) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }
  }

  onHotspot(hotspot, x, y) {
    this.setState({ audioTime: 0 });
    this.state.audio.stop();
    this.hotspotPhrase.triggerAnimation(hotspot.text, x, y);
    this.state.audio.play('hotspot', hotspot.audio);
  }

  hasHomeButton() {
    return this.props.page.id !== 'home';
  }

  hasBackButton() {
    return this.hasHomeButton() && this.props.page.back;
  }

  onBackButtonClick() {
    this.props.dispatch(choosePage(this.props.page.back));
  }

  onHomeButtonClick() {
    this.props.dispatch(choosePage(''));
    this.props.dispatch(chooseAutoplay(false));
  }

  onButtonClick(page) {
    if (page === 'read' || page === 'readAudio') {
      this.props.dispatch(choosePage(1));
      this.props.dispatch(chooseAutoplay(page === 'readAudio'));
      return;
    }
    this.props.dispatch(choosePage(page));
  }

  onPlayPauseButtonClick() {
    if (this.state.playButton === 'play') {
      this.state.audio.play('page', this.props.page.pageAudio);
    } else {
      this.state.audio.pause();
    }
  }

  onWordClick(word) {
    this.setState({ audioTime: 0 });
    this.state.audio.stop();
    this.state.audio.play('word', word.audio);
  }

  // FIXME
  pagePrev() {
    if (isNaN(this.props.page.id)) {
      return;
    }

    const newPage = this.props.page.id - 1;
    this.props.dispatch(choosePage(newPage));
  }

  pageNext() {
    if (isNaN(this.props.page.id)) {
      return;
    }

    const newPage = this.props.page.id + 1;
    this.props.dispatch(choosePage(newPage));
  }
}
*/
