'use strict';
import React from 'react';
import BookHotspotMap from './BookHotspotMap.tsx';
import BookHotspotPhrase from './BookHotspotPhrase.tsx';
import IconButton from '@material-ui/core/IconButton';

// FIXME - const MousetrapMixins = require('../mixins/MousetrapMixins.js');

import Constants from '../constants/AppConstants.js';

import BookAudio from '../models/BookAudio.jsx';
import BookWord from './BookWord.tsx';
import ImageButton from './ImageButton.tsx';
import { choosePage, chooseAutoplay } from '../actions.js';
import { LanguageCode } from '../atoms.ts';
import { Book, BookPage } from '../models/Book.ts';

const clickThreshold = 5;

interface Props {
  page: BookPage;
  book: Book;
  language: LanguageCode;
  children: React.ReactNode;
}

interface State {
  audio: BookAudio;
  audioTime: number;
  playButton: string;
}

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

  componentDidMount() {
    const audio = new BookAudio(this.props.page.assetManager);
    audio.bind('page', 'play', this.onPagePlay);
    audio.bind('page', 'pause', this.onPagePause);
    audio.bind('page', 'ended', this.onPageEnded);
    audio.bind('page', 'timeupdate', this.onPageTime);
    this.setState({ audio });

    /* FIXME */
    // this.bindShortcut('left', this.pagePrev);
    // this.bindShortcut('right', this.pageNext);

    this.onNewPage(this.props);
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
    const ret = {
      position: 'relative',
      width: `${this.getPageWidth()}px`,
      height: `${this.getPageHeight()}px`,
    };
    if (this.props.page.pageImage) {
      ret.backgroundSize = 'contain';
      ret.backgroundImage = `url(${this.props.page.assetManager.getAssetSrc(
        this.props.page.pageImage
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

  render() {
    const key = [
      'book',
      this.props.book,
      'language',
      this.props.language,
      'page',
      this.props.page,
    ].join('_');

    const pageStyle = this.getPageStyle();

    const extraImages = this.props.page.images.map((image) => {
      const style = {
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
        style.backgroundImage = `url(${this.props.page.assetManager.getAssetSrc(image.image)})`;
        return (
          <IconButton
            key={`button_${image.nextPage}`}
            style={style}
            onClick={this.onButtonClick.bind(this, image.nextPage)}
          />
        );
      }
      return (
        <img
          key={`button_${image.image}`}
          style={style}
          src={this.props.page.assetManager.getAssetSrc(image.image)}
        />
      );
    });

    const extraLines = this.props.page.lines.map((line, lineIdx) => {
      const words = line.words.map((word, wordIdx) => {
        return (
          <BookWord
            key={`word${wordIdx}`}
            audioTime={this.state.audioTime}
            {...word}
            onClick={this.onWordClick.bind(this, word)}
          />
        );
      });
      const style = {
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
    if (this.hasBackButton()) {
      homeBackButton = (
        <ImageButton
          key="homeButton"
          top="0"
          left="0"
          assetManager={this.props.page.assetManager}
          image={'buttons/control_back.png'}
          onClick={this.onBackButtonClick}
        />
      );
    } else {
      homeBackButton = (
        <ImageButton
          key="backButton"
          top="0"
          left="0"
          assetManager={this.props.page.assetManager}
          image={'buttons/control_home.png'}
          enabled={this.hasHomeButton()}
          onClick={this.onHomeButtonClick}
        />
      );
    }
    //  FIXME replace refs with https://facebook.github.io/react/docs/top-level-api.html#react.finddomnode for BookPage
    return (
      <Hammer key={key} onSwipe={this.onSwipe}>
        <div
          style={pageStyle}
          ref={(node) => (this.bookpage = node)}
          onClick={this.onClickPage}
        >
          <BookHotspotMap
            ref={(hotspotMap) => {
              this.hotspotMap = hotspotMap;
            }}
            {...this.props.page.hotspot}
            assetManager={this.props.page.assetManager}
            height={this.getPageHeight()}
            width={this.getPageWidth()}
            onHotspot={this.onHotspot}
          />
          <BookHotspotPhrase
            ref={(hotspotPhrase) => {
              this.hotspotPhrase = hotspotPhrase;
            }}
            {...this.props.page.styles.unread}
          />
          <div
            style={{
              top: 0,
              left: 0,
              position: 'absolute',
              height: '100%',
              width: `${clickThreshold}%`,
            }}
            onClick={this.pagePrev}
          />
          <div
            style={{
              top: 0,
              right: 0,
              position: 'absolute',
              height: '100%',
              width: `${clickThreshold}%`,
            }}
            onClick={this.pageNext}
          />
          {homeBackButton}
          <ImageButton
            id="playPauseButton"
            top="0"
            right="0"
            assetManager={this.props.page.assetManager}
            image={`buttons/control_${this.state.playButton}.png`}
            enabled={this.hasPlayButton()}
            onClick={this.onPlayPauseButtonClick}
          />
          {extraImages}
          {extraLines}
          {this.props.children}
        </div>
      </Hammer>
    );
  }

  onHotspot(hotspot, x, y) {
    this.setState({ audioTime: 0 });
    this.state.audio.stop();
    this.hotspotPhrase.triggerAnimation(hotspot.text, x, y);
    this.state.audio.play('hotspot', hotspot.audio);
  }

  getPageHeight() {
    return Constants.Dimensions.HEIGHT;
    /*
    let dom = this.bookpage.getDOMNode();
    return dom.offsetHeight || dom.clientHeight;
    */
  }

  getPageWidth() {
    return Constants.Dimensions.WIDTH;
    /*
    let dom = this.bookpage.getDOMNode();
    return dom.offsetWidth || dom.clientWidth;
    */
  }

  onSwipe(e) {
    if (e.direction & HammerJS.DIRECTION_LEFT) {
      if (this.pageNext) {
        this.pageNext();
      }
    } else if (e.direction & HammerJS.DIRECTION_RIGHT) {
      if (this.pagePrev) {
        this.pagePrev();
      }
    }
  }

  hasHomeButton() {
    return this.props.page.id !== 'home';
  }

  hasBackButton() {
    return this.hasHomeButton() && this.props.page.back;
  }

  hasPlayButton() {
    return !!this.props.page.pageAudio;
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

  onPagePlay() {
    this.setState({ playButton: 'pause' });
  }

  onPagePause() {
    this.setState({ playButton: 'play' });
  }

  onPageEnded() {
    this.setState({
      playButton: 'play',
    });
  }

  onPageTime(time) {
    if (time) {
      this.setState({ audioTime: time });
    }
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

  /* FIXME */
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

export default Screen;
