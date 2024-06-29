import IconButton from '@mui/material/IconButton';
import { useAtom } from 'jotai';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  useContext,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { bookAutoplayAtom, bookPageAtom } from '../atoms.ts';
import Constants from '../constants/AppConstants.js';
import useSwipe from '../hooks/useSwipe.ts';
import { BookHotspot, BookImage, BookPage } from '../models/Book.ts';
import { BookAudio, TimeUpdateEvent } from '../models/BookAudio.jsx';
import BookHotspotMap from './BookHotspotMap.tsx';
import BookWord from './BookWord.tsx';
import ImageButton from './ImageButton.tsx';
import { AssetManagerContext } from '../AssetManager.ts';

const clickThreshold = 5;

interface Props {
  page: BookPage;
}

const hotspotTimeouts: Record<string, NodeJS.Timeout> = {};

function createHotspotAnimation(
  text: string,
  x: number,
  y: number,
  cleanupHotspot: (uuid: string) => void
): HotspotAnimation {
  const uuid = uuidv4();
  const duration = 1000; // FIXME - random

  hotspotTimeouts[uuid] = setTimeout(() => {
    cleanupHotspot(uuid);
    delete hotspotTimeouts[uuid];
  }, duration);

  return {
    uuid: uuid,
    x: x,
    y: y,
    word: text,
    duration: duration,
  };
}

function ScreenImageButton({
  image,
  onButtonClick,
}: {
  image: BookImage;
  onButtonClick: (page: string) => void;
}) {
  const assetManager = useContext(AssetManagerContext);
  const onClick = () => {
    if (image.nextPage) {
      onButtonClick(image.nextPage);
    }
  };

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
  uuid: string;
  word: string;
  x: number;
  y: number;
  duration: number;
}

function Screen(properties: Props) {
  const assetManager = useContext(AssetManagerContext);
  const [, setBookPage] = useAtom(bookPageAtom);
  const [autoplay, setAutoplay] = useAtom(bookAutoplayAtom);
  const [hotspots, setHotspots] = useState<Array<HotspotAnimation>>([]);
  const [audioTime, setAudioTime] = useState<number>(0);
  const [playButton, setPlayButton] = useState<string>('play');
  const audioReference = useRef<BookAudio | null>(null);

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
    if (autoplay == 'true' && properties.page.audio) {
      audioReference.current?.play('page', properties.page.audio);
    }
  }, [audioReference, autoplay, properties.page]);

  useEffect(() => {
    const audio = new BookAudio(assetManager);
    audio.bind('page', 'play', onPagePlay);
    audio.bind('page', 'pause', onPagePause);
    audio.bind('page', 'ended', onPageEnded);
    audio.bind('page', 'timeupdate', onPageTime);
    audioReference.current = audio;

    onNewPage();

    return () => {
      audioReference.current?.removeAll();
    };
  }, [assetManager, onNewPage]);

  useEffect(() => {
    properties.page && onNewPage();
  }, [properties.page, onNewPage]);

  useEffect(() => {
    return () => {
      for (const timeoutId of Object.values(hotspotTimeouts)) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const getPageStyle = () => {
    const returnValue: React.CSSProperties = {
      position: 'relative',
      width: `${getPageWidth()}px`,
      height: `${getPageHeight()}px`,
    };
    if (properties.page.image) {
      returnValue.backgroundSize = 'contain';
      returnValue.backgroundImage = `url(${assetManager.getAssetSrc(properties.page.image)})`;
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

  const cleanupHotspot = (uuid: string) => {
    setHotspots((previousState) =>
      previousState.filter((h) => h.uuid !== uuid)
    );
  };

  const onHotspot = (hotspot: BookHotspot, x: number, y: number) => {
    setAudioTime(0);
    setPlayButton('play');
    setHotspots((existingHotspots) => [
      ...existingHotspots,
      createHotspotAnimation(hotspot.text, x, y, cleanupHotspot),
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
    if (page === 'readAudio') {
      setAutoplay(true);
    }
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

  const extraImages = properties.page.images.map((image, index) => (
    <ScreenImageButton
      key={index}
      image={image}
      onButtonClick={onButtonClick}
    />
  ));

  const extraLines = properties.page.lines.map((line, lineIndex) => {
    const words = line.words.map((word, wordIndex) => {
      return (
        <BookWord
          key={`word_${lineIndex}_${wordIndex}`}
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
      image={'buttons/control_back.png'}
      onClick={onBackButtonClick}
    />
  ) : (
    <ImageButton
      key="backButton"
      top="0"
      left="0"
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
      onKeyDown={onKeyDown}
    >
      <BookHotspotMap
        mask={properties.page.hotspot.mask}
        hotspots={properties.page.hotspot.hotspots}
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
            border: '1px solid red',
            transform: 'translate(-50%, -50%)', // move it half way over so its centered
            position: 'absolute',
            top: hotspot.y,
            left: hotspot.x,
            textShadow: '2px 2px 2px gray',
            ...properties.page.styles.UNREAD,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              position: 'absolute',
            }}
          >
            {hotspot.word}
          </div>
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
