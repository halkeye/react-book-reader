'use strict';
const React = require('react');
const AppConstants = require('../constants/AppConstants.js');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');
const BookWord = require('../components/BookWord.jsx');
const ImageButton = require('../components/ImageButton.jsx');
const play = require('play-audio');

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
    return {
      playButton: 'play',
      page: null
    };
  },

  getPageStyle() {
    let ret = {
      position: 'relative',
      width: AppConstants.Dimensions.WIDTH + 'px', // fixme
      height: AppConstants.Dimensions.HEIGHT + 'px', // fixme
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
        height: image.height + '%',
      };
      if (image.nextPage) {
        style.border = 'none';
        style.backgroundSize = 'contain';
        style.backgroundColor = 'rgba(0,0,0,0.0)';
        style.backgroundImage = 'url(' + image.image + ')';
        return (
          <IconButton style={style} onClick={this.onButtonClick.bind(this,image.nextPage)}></IconButton>
        );
      }
      return <img style={style} src={image.image} />;
    });

    let extraLines = this.state.page.lines.map((line,lineIdx) => {
      let words = line.words.map((word,wordIdx) => {
        return <BookWord key={ 'word' + wordIdx } onClick={this.onWordClick.bind(this, word.word)}>{word.word}</BookWord>;
      });
      var style = {
        position: 'absolute',
        top: line.top + '%',
        left: line.left + '%',
        color: this.state.page.pageStyle.unread.color,
        fontFamily: this.state.page.pageStyle.unread.font,
        fontSize: this.state.page.pageStyle.unread.size + 'px'
      };
      return <div key={ 'line' + lineIdx } style={style}>{words}</div>;
    });

    return (
      <div key={key} style={pageStyle}>
        <ImageButton id="homeButton" top="0" left="0" image={this.state.page.assetBaseUrl + "/buttons/control_home.png"} enabled={this.hasHomeButton()} onClick={this.onHomeButtonClick} />
        <ImageButton id="playPauseButton" top="0" right="0" image={this.state.page.assetBaseUrl + "/buttons/control_"+this.state.playButton+".png"} enabled={this.hasPlayButton()} onClick={this.onPlayPauseButtonClick} />
        {extraImages}
        {extraLines}
      </div>
    );
  },

  hasHomeButton() {
    return this.props.page != "home";
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
    if (page == 'read' || page == 'readAudio') {
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

  onPlayPauseButtonClick() {
    if (this.state.audio) {
      if (this.state.playButton == 'play') {
        this.state.audio.play();
      } else {
        this.state.audio.pause();
      }
      return;
    }
    let audio = play(this.state.page.pageAudio).preload().autoplay();
    audio.on('play', () => {
      this.setState({ playButton: 'pause' });
    });
    audio.on('pause', () => {
      this.setState({ playButton: 'play' });
    });
    audio.on('ended', () => {
      this.setState({ playButton: 'play' });
      this.state.audio.remove();
      this.setState({ audio: null });
    });
    audio.on('timeupdate', () => {
      this.setState({ audioTime: this.state.audio.currentTime() });
    });
    this.setState({ audio: audio });
  },

  onWordClick(word) {
  },

  componentWillUnmount() {
    if (this.state.audio) {
      this.state.audio.pause();
      this.state.audio.remove();
    }
  }
};

module.exports = BookPageMixin;
