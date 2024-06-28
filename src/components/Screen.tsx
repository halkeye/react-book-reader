import IconButton from '@mui/material/IconButton';
import { useAtom } from 'jotai';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  MouseEvent,
  KeyboardEvent,
  createRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import AssetManager from '../AssetManager.ts';
import { bookAutoplayAtom, bookPageAtom } from '../atoms.ts';
import Constants from '../constants/AppConstants.js';
import useSwipe from '../hooks/useSwipe.ts';
import { Book, BookHotspot, BookImage, BookPage } from '../models/Book.ts';
import { BookAudio, TimeUpdateEvent } from '../models/BookAudio.jsx';
import BookHotspotMap from './BookHotspotMap.tsx';
import BookWord from './BookWord.tsx';
import ImageButton from './ImageButton.tsx';

const clickThreshold = 5;

interface Props {
  page: BookPage;
  book: Book;
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
      alt=""
      style={style}
      src={assetManager.getAssetSrc(image.image)}
    />
  );
}

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

interface HotspotAnimation {
  interval: NodeJS.Timeout;
  uuid: string;
  word: string;
  x: number;
  y: number;
  duration: number;
}

export function Screen(properties: Props) {
  const [, setBookPage] = useAtom(bookPageAtom);
  const [autoplay, setAutoplay] = useAtom(bookAutoplayAtom);
  const [hotspots, setHotspots] = useState<Array<HotspotAnimation>>([]);
  const [audioTime, setAudioTime] = useState<number>(0);
  const [playButton, setPlayButton] = useState<string>('play');
  const audioReference = useRef<BookAudio | null>(null);
  const hotspotMapReference = createRef<BookHotspotMap>();

  const pagePrevious = () => {
    const pageNumber = Number.parseInt(properties.page.id, 10);
    if (Number.isNaN(pageNumber)) {
      return;
    }
    setBookPage((pageNumber - 1).toString());
  };

  const pageNext = () => {
    const pageNumber = Number.parseInt(properties.page.id, 10);
    if (Number.isNaN(pageNumber)) {
      return;
    }
    setBookPage((pageNumber + 1).toString());
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case 'ArrowLeft': {
        pagePrevious();
        break;
      }
      case 'ArrowRight': {
        pageNext();
        break;
      }
      default: {
        return;
      } // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
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

    onNewPage();

    return () => {
      audioReference.current?.removeAll();
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

  const onPageTime = (event: Event) => {
    if (event instanceof TimeUpdateEvent && event.time) {
      setAudioTime(event.time);
    }
  };

  const hasPlayButton = () => {
    return !!properties.page.audio;
  };

  const onHotspot = (hotspot: BookHotspot, x: number, y: number) => {
    const uuid = uuidv4();
    const duration = 1000; // FIXME - random
    setAudioTime(0);
    setHotspots([
      ...hotspots,
      {
        interval: setTimeout(() => {
          setHotspots((previousState) =>
            previousState.filter((h) => h.uuid !== uuid)
          );
        }, duration),
        uuid: uuid,
        x: x,
        y: y,
        word: hotspot.text,
        duration: duration,
      },
    ]);
    if (audioReference.current) {
      audioReference.current.stop();
      audioReference.current.play('hotspot', hotspot.audio);
    }
  };

  const onBackButtonClick = () => {
    setBookPage(properties.page.back);
    setAutoplay(false);
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

  const onClickPage = useCallback(
    (event: MouseEvent) => {
      if (
        hotspotMapReference.current &&
        event.currentTarget &&
        event.currentTarget instanceof HTMLElement
      ) {
        const x = event.pageX - event.currentTarget.offsetLeft;
        const y = event.pageY - event.currentTarget.offsetTop;
        if (hotspotMapReference.current.onClickImage(x, y)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },
    [hotspotMapReference]
  );

  // const key = ['book', properties.book, 'page', properties.page].join('_');

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

  const homeBackButton = hasBackButton() ? (
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
    <div
      role="none"
      style={getPageStyle()}
      {...swipeHandlers}
      onClick={onClickPage}
      onKeyDown={onKeyDown}
    >
      <BookHotspotMap
        ref={hotspotMapReference}
        mask={properties.page.hotspot.mask}
        hotspots={properties.page.hotspot.hotspots}
        assetManager={properties.page.assetManager}
        height={getPageHeight()}
        width={getPageWidth()}
        onHotspot={onHotspot}
      />
      {hotspots.map((hotspot) => (
        <div
          key={hotspot.uuid}
          style={{
            animation: `hotspotAnimation ${hotspot.duration / 1000}s ease-out`,
            willChange: 'opacity, transform',
            position: 'absolute',
            top: hotspot.y,
            left: hotspot.x,
            textShadow: '2px 2px 2px gray',
            ...properties.page.styles.UNREAD,
          }}
        >
          {hotspot.word}
        </div>
      ))}
      <div
        role="none"
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
        role="none"
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
    </div>
  );
}

export default Screen;
