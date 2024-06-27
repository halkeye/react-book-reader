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

export function Screen(properties: Props) {
  const [, setBookPage] = useAtom(bookPageAtom);
  const [autoplay, setAutoplay] = useAtom(bookAutoplayAtom);
  const [audioTime, setAudioTime] = useState<number>(0);
  const [playButton, setPlayButton] = useState<string>('play');
  const audioReference = useRef<BookAudio | null>(null);
  const hotspotPhraseReference = useRef<typeof BookHotspotPhrase | null>(null);
  const hotspotMapReference = createRef<BookHotspotMap>();

  const pagePrevious = () => {
    const pageNumber = Number.parseInt(properties.page.id, 10);
    if (isNaN(pageNumber)) {
      return;
    }
    setBookPage((pageNumber - 1).toString());
  };

  const pageNext = () => {
    const pageNumber = Number.parseInt(properties.page.id, 10);
    if (isNaN(pageNumber)) {
      return;
    }
    setBookPage((pageNumber + 1).toString());
  };

  const onSwipedLeft = () => {
    pageNext();
  };

  const onSwipedRight = () => {
    pagePrevious();
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
    audioReference.current?.stop();
    restartState();
    if (autoplay && properties.page.audio) {
      audioReference.current?.play('page', properties.page.audio);
    }
  }, [audioReference, autoplay, properties.page.audio]);

  useEffect(() => {
    const audio = new BookAudio(properties.page.assetManager);
    audio.bind('page', 'play', onPagePlay);
    audio.bind('page', 'pause', onPagePause);
    audio.bind('page', 'ended', onPageEnded);
    audio.bind('page', 'timeupdate', onPageTime);
    audioReference.current = audio;

    // FIXME
    // bindShortcut('left', pagePrev);
    // bindShortcut('right', pageNext);

    onNewPage();

    return () => {
      audioReference.current?.removeAll();
      // unbindShortcut('left');
      // unbindShortcut('right');
    };
  }, [properties.page.assetManager, onNewPage]);

  useEffect(() => {
    properties.page && onNewPage();
  }, [properties.page, onNewPage]);

  const getPageStyle = () => {
    const returnValue: React.CSSProperties = {
      position: 'relative',
      width: `${getPageWidth()}px`,
      height: `${getPageHeight()}px`,
    };
    if (properties.page.image) {
      returnValue.backgroundSize = 'contain';
      returnValue.backgroundImage = `url(${properties.page.assetManager.getAssetSrc(properties.page.image)})`;
    }
    return returnValue;
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
    return !!properties.page.audio;
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
    if (audioReference.current) {
      audioReference.current.stop();
    }
    if (hotspotPhraseReference.current) {
      hotspotPhraseReference.current.triggerAnimation(hotspot.text, x, y);
    }
    if (audioReference.current) {
      audioReference.current.play('hotspot', hotspot.audio);
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
    return properties.page.id !== 'home';
  };

  const hasBackButton = () => {
    return hasHomeButton() && 'back' in properties.page;
  };

  const onWordClick = (_word: string, audio: string) => {
    setAudioTime(0);
    if (audioReference.current) {
      audioReference.current.stop();
      audioReference.current.play('word', audio);
    }
  };

  const onPlayPauseButtonClick = () => {
    if (playButton === 'play') {
      if (audioReference.current) {
        audioReference.current.play('page', properties.page.audio);
      }
    } else {
      if (audioReference.current) {
        audioReference.current.pause();
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
    properties.book,
    'language',
    properties.language,
    'page',
    properties.page,
  ].join('_');

  const extraImages = properties.page.images.map((image, index) => (
    <ScreenImageButton
      key={index}
      image={image}
      onButtonClick={onButtonClick}
      assetManager={properties.page.assetManager}
    />
  ));

  const extraLines = properties.page.lines.map((line, lineIndex) => {
    const words = line.words.map((word, wordIndex) => {
      return (
        <BookWord
          key={`word${wordIndex}`}
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
      <div key={`line${lineIndex}`} style={style}>
        {words}
      </div>
    );
  });

  let homeBackButton;
  homeBackButton = hasBackButton() ? (
      <ImageButton
        key="homeButton"
        top="0"
        left="0"
        assetManager={properties.page.assetManager}
        image={'buttons/control_back.png'}
        onClick={onBackButtonClick}
      />
    ) : (
      <ImageButton
        key="backButton"
        top="0"
        left="0"
        assetManager={properties.page.assetManager}
        image={'buttons/control_home.png'}
        enabled={hasHomeButton()}
        onClick={onHomeButtonClick}
      />
    );

  return (
    <div style={getPageStyle()} {...swipeHandlers} onClick={onClickPage}>
      <BookHotspotMap
        ref={hotspotMapReference}
        {...properties.page.hotspot}
        assetManager={properties.page.assetManager}
        height={getPageHeight()}
        width={getPageWidth()}
        onHotspot={onHotspot}
      />
      <BookHotspotPhrase
        phrase={'word'}
        x={1}
        y={1}
        {...properties.page.styles.unread}
      />
      <div
        style={{
          top: 0,
          left: 0,
          position: 'absolute',
          height: '100%',
          width: `${clickThreshold}%`,
        }}
        onClick={pagePrevious}
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
        assetManager={properties.page.assetManager}
        image={`buttons/control_${playButton}.png`}
        enabled={hasPlayButton()}
        onClick={onPlayPauseButtonClick}
      />
      {extraImages}
      {extraLines}
      {properties.children}
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
