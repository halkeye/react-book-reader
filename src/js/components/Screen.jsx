'use strict';
const React = require('react');
const HammerJS = require('hammerjs');
const Hammer = require('react-hammerjs');

const MousetrapMixins = require('../mixins/MousetrapMixins.js');
const BookActionCreators = require('../actions/BookActionCreators');

const Constants = require('../constants/AppConstants');

const BookWord = require('../components/BookWord.jsx');
const ImageButton = require('../components/ImageButton.jsx');

const BookAudio = require('../models/BookAudio.jsx');

const mui = require('material-ui');
let {IconButton} = mui;

let Screen = React.createClass({
  mixins: [MousetrapMixins], // FIXME - move later
  propTypes: {
    //audio: React.PropTypes.string,
  },

  getInitialProps() {
    return {
      styles: {}
    };
  },

  getInitialState() {
    return {
      audioTime: 0,
      playButton: 'play'
    };
  },

  componentDidMount() {
    let audio = new BookAudio();
    audio.bind('page', 'play', this.onPagePlay);
    audio.bind('page', 'pause', this.onPagePause);
    audio.bind('page', 'ended', this.onPageEnded);
    audio.bind('page', 'timeupdate', this.onPageTime);
    this.audio = audio;

    /* FIXME */
    this.bindShortcut('left', this.pageLeft);
    this.bindShortcut('right', this.pageRight);

    this.onNewPage(this.props);
  },

  componentWillUnmount() {
    this.audio.removeAll();
    this.unbindShortcut('left');
    this.unbindShortcut('right');
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.page !== nextProps.page) { this.onNewPage(nextProps); }
  },

  onNewPage(props) {
    this.audio.stop();
    this.replaceState(this.getInitialState(), function() {
      if (props.autoplay) {
        this.audio.play('page', props.page.pageAudio);
      }
    });
  },

  getPageStyle() {
    let ret = {
      position: 'relative',
      width: Constants.Dimensions.WIDTH + 'px', // FIXME
      height: Constants.Dimensions.HEIGHT + 'px' // FIXME
    };
    if (this.props.page.pageImage) {
      ret.backgroundSize = 'contain';
      ret.backgroundImage = 'url(' + this.props.page.pageImage + ')';
    }
    return ret;
  },

  render() {
    let key = [
      'book', this.props.book,
      'language', this.props.language,
      'page', this.props.page
    ].join('_');

    let pageStyle = this.getPageStyle();

    let extraImages = this.props.page.images.map((image) => {
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
          <IconButton key={"button_" + image.nextPage} style={style} onClick={this.onButtonClick.bind(this, image.nextPage)}></IconButton>
        );
      }
      return <img key={"button_" + image.image} style={style} src={image.image} />;
    });

    let extraLines = this.props.page.lines.map((line, lineIdx) => {
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
          <ImageButton id="homeButton" top="0" left="0" image={this.props.page.assetBaseUrl + "/buttons/control_home.png"} enabled={this.hasHomeButton()} onClick={this.onHomeButtonClick} />
          <ImageButton id="playPauseButton" top="0" right="0" image={this.props.page.assetBaseUrl + "/buttons/control_"+this.state.playButton+".png"} enabled={this.hasPlayButton()} onClick={this.onPlayPauseButtonClick} />
          {extraImages}
          {extraLines}
        </div>
      </Hammer>
    );
  },

  onTap(e) {
    let dom = this.refs.bookpage.getDOMNode();
    if (e.target !== dom) { return; }

    let width = dom.offsetWidth || dom.clientWidth;
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
    return this.props.page.id !== "home";
  },

  hasPlayButton() {
    return !!this.props.page.pageAudio;
  },

  onHomeButtonClick() {
    return BookActionCreators.changePage({ page: '', autoplay: false });
  },

  onButtonClick(page) {
    if (page === 'read' || page === 'readAudio') {
      return BookActionCreators.changePage({
        page: 1,
        autoplay: page === 'readAudio'
      });
    }
    return BookActionCreators.changePage({ page: page });
  },


  onPagePlay() { this.setState({ playButton: 'pause' }); },
  onPagePause() { this.setState({ playButton: 'play' }); },
  onPageEnded() {
    this.setState({
      playButton: 'play'
    });
  },
  onPageTime(time) { this.setState({ audioTime: time }); },

  onPlayPauseButtonClick() {
    if (this.state.playButton === 'play') {
      this.audio.play('page', this.props.page.pageAudio);
    } else {
      this.audio.pause();
    }
  },

  onWordClick(word) {
    this.setState({ audioTime: 0 });
    this.audio.stop();
    this.audio.play('word', word.audio);
  },


  /* FIXME */
  pageLeft() {
    var newPage = this.props.page.id-1;
    return BookActionCreators.changePage({ page: newPage });
  },
  pageRight() {
    var newPage = this.props.page.id+1;
    return BookActionCreators.changePage({ page: newPage });
  }
});
module.exports = Screen;
