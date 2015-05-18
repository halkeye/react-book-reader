'use strict';
const React = require('react');
const HammerJS = require('hammerjs');

const Hammer = require('react-hammerjs');

const AppConstants = require('../constants/AppConstants.js');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');
const BookWord = require('../components/BookWord.jsx');
const ImageButton = require('../components/ImageButton.jsx');

const BookAudio = require('../models/BookAudio.jsx');

const mui = require('material-ui');
let {IconButton} = mui;

let BookPageMixin = {
  componentDidMount() {
    BookStore.getPage(this.props.book, this.props.language, this.props.page).then((page) => {
      this.setState({ page: page });
      if (this.props.autoplay === true) {
        this.onPlayPauseButtonClick();
      }
    }).catch((ex) => {
      console.log('getPage error: ' + ex);
    });
  },

  getInitialState() {
    let audio = new BookAudio();
    audio.bind('page', 'play', this.onPagePlay);
    audio.bind('page', 'pause', this.onPagePause);
    audio.bind('page', 'ended', this.onPageEnded);
    audio.bind('page', 'timeupdate', this.onPageTime);

    return {
      audio: audio,
      playButton: 'play',
      page: null
    };
  },

  getPageStyle() {
    let ret = {
      position: 'relative',
      width: AppConstants.Dimensions.WIDTH + 'px', // fixme
      height: AppConstants.Dimensions.HEIGHT + 'px' // fixme
    };
    if (this.state.page.pageImage) {
      ret.backgroundSize = 'contain';
      ret.backgroundImage = 'url(' + this.state.page.pageImage + ')';
    }
    return ret;
  },

  render() {
    let key = [
      'book', this.props.book,
      'language', this.props.language,
      'page', this.props.page
    ].join('_');

    if ( this.state.page === null ) { return <div key={key} />; }

    let pageStyle = this.getPageStyle();

    let extraImages = this.state.page.images.map((image) => {
      var style = {
        position: 'absolute',
        top: image.top + '%',
        left: image.left + '%',
        width: image.width + '%',
        height: image.height + '%'
      };
      if (image.nextPage) {
        style.border = 'none';
        style.backgroundSize = 'contain';
        style.backgroundColor = 'rgba(0,0,0,0.0)';
        style.backgroundImage = 'url(' + image.image + ')';
        return (
          <IconButton style={style} onClick={this.onButtonClick.bind(this, image.nextPage)}></IconButton>
        );
      }
      return <img style={style} src={image.image} />;
    });

    let extraLines = this.state.page.lines.map((line, lineIdx) => {
      let words = line.words.map((word, wordIdx) => {
        return <BookWord key={ 'word' + wordIdx } audioTime={this.state.audioTime} {...word} onClick={this.onWordClick.bind(this, word)} />;
      });
      var style = {
        position: 'absolute',
        top: line.top + '%',
        left: line.left + '%'
      };
      return <div key={ 'line' + lineIdx } style={style}>{words}</div>;
    });
    //  FIXME replace refs with https://facebook.github.io/react/docs/top-level-api.html#react.finddomnode for BookPage
    return (
      <Hammer key={key} onSwipe={this.onSwipe} onTap={this.onTap}>
        <div style={pageStyle} ref="bookpage">
          <ImageButton id="homeButton" top="0" left="0" image={this.state.page.assetBaseUrl + "/buttons/control_home.png"} enabled={this.hasHomeButton()} onClick={this.onHomeButtonClick} />
          <ImageButton id="playPauseButton" top="0" right="0" image={this.state.page.assetBaseUrl + "/buttons/control_"+this.state.playButton+".png"} enabled={this.hasPlayButton()} onClick={this.onPlayPauseButtonClick} />
          {extraImages}
          {extraLines}
        </div>
      </Hammer>
    );
  },

  onTap(e) {
    let width = this.refs.bookpage.getDOMNode().offsetWidth || this.refs.bookpage.getDOMNode().clientWidth;
    if (e.center.x <= width * 0.10) {
      if (this.pageLeft) { this.pageLeft(); }
    }
    else if (e.center.x >= width-(width * 0.10)) {
      if (this.pageRight) { this.pageRight(); }
    }
  },

  onSwipe(e) {
    if (e.direction & HammerJS.DIRECTION_LEFT) {
      if (this.pageRight) { this.pageRight(); }
    }
    else if (e.direction & HammerJS.DIRECTION_RIGHT) {
      if (this.pageLeft) { this.pageLeft(); }
    }
  },

  hasHomeButton() {
    return this.props.page !== "home";
  },

  hasPlayButton() {
    return !isNaN(this.props.page);
  },

  onHomeButtonClick() {
    BookActionCreators.chooseLanguage(
      this.props.book,
      this.props.language
    );
  },

  onButtonClick(page) {
    let autoplay = false;
    if (page === 'read' || page === 'readAudio') {
      if (page === 'readAudio') { autoplay = true; }
      page = 1;
    }
    BookActionCreators.choosePage(
      this.props.book,
      this.props.language,
      page,
      autoplay
    );
  },


  onPagePlay() { this.setState({ playButton: 'pause' }); },
  onPagePause() { this.setState({ playButton: 'play' }); },
  onPageEnded() {
    this.setState({
      playButton: 'play',
      audioTime: 10000000 // hack to force all text to pretend its been read
    });
  },
  onPageTime(time) { this.setState({ audioTime: time }); },

  onPlayPauseButtonClick() {
    if (this.state.playButton === 'play') {
      this.state.audio.play('page', this.state.page.pageAudio);
    } else {
      this.state.audio.pause();
    }
  },

  onWordClick(word) {
    this.state.audio.stop();
    this.state.audio.play('word', word.audio);
  },

  componentWillUnmount() {
    this.state.audio.removeAll();
  }
};

module.exports = BookPageMixin;
