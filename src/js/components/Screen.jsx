'use strict';
const React = require('react');
const createReactClass = require('create-react-class');
const HammerJS = require('hammerjs');
const Hammer = require('react-hammerjs');

const MousetrapMixins = require('../mixins/MousetrapMixins.js');
const BookActionCreators = require('../actions/BookActionCreators');

const Constants = require('../constants/AppConstants');

const BookAudio = require('../models/BookAudio.jsx');

import BookHotspotMap from '../components/BookHotspotMap.jsx';
import BookHotspotPhrase from '../components/BookHotspotPhrase.jsx';

const BookWord = require('../components/BookWord.jsx');
const ImageButton = require('../components/ImageButton.jsx');
import {IconButton} from 'material-ui';

let clickThreshold = 5;

let Screen = createReactClass({
  displayName: 'Screen',

  // FIXME - move later
  mixins: [MousetrapMixins],

  propTypes: {
    //audio: React.PropTypes.string,
  },

  getInitialProps() {
    return {
      styles: {}
    };
  },

  restartState() {
    return {
      audioTime: 0,
      playButton: 'play'
    };
  },

  getInitialState() {
    return this.restartState();
  },

  componentDidMount() {
    let audio = new BookAudio(this.props.page.asset_manager);
    audio.bind('page', 'play', this.onPagePlay);
    audio.bind('page', 'pause', this.onPagePause);
    audio.bind('page', 'ended', this.onPageEnded);
    audio.bind('page', 'timeupdate', this.onPageTime);
    this.audio = audio;

    /* FIXME */
    this.bindShortcut('left', this.pagePrev);
    this.bindShortcut('right', this.pageNext);

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
    this.replaceState(this.restartState(), function() {
      if (props.autoplay && props.page.pageAudio) {
        this.audio.play('page', props.page.pageAudio);
      }
    });
  },

  getPageStyle() {
    let ret = {
      position: 'relative',
      width: this.getPageWidth() + 'px',
      height: this.getPageHeight() + 'px'
    };
    if (this.props.page.pageImage) {
      ret.backgroundSize = 'contain';
      ret.backgroundImage = 'url(' + this.props.page.asset_manager.getAssetSrc(this.props.page.pageImage) + ')';
    }
    return ret;
  },

  onClickPage(ev) {
    if (this.refs.hotspotMap) {
      let x = ev.pageX - ev.currentTarget.offsetLeft;
      let y = ev.pageY - ev.currentTarget.offsetTop;
      this.refs.hotspotMap.onClickImage(x, y);
    }
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
        style.backgroundImage = 'url(' + this.props.page.asset_manager.getAssetSrc(image.image) + ')';
        return (
          <IconButton key={"button_" + image.nextPage} style={style} onClick={this.onButtonClick.bind(this, image.nextPage)}></IconButton>
        );
      }
      return <img key={"button_" + image.image} style={style} src={this.props.page.asset_manager.getAssetSrc(image.image)} />;
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
    let homeBackButton = '';
    if (this.hasBackButton()) {
      homeBackButton = (
          <ImageButton id="homeButton" top="0" left="0" asset_manager={this.props.page.asset_manager} image={"buttons/control_back.png"} onClick={this.onBackButtonClick} />
      );
    } else {
      homeBackButton = (
          <ImageButton id="backButton" top="0" left="0" asset_manager={this.props.page.asset_manager} image={"buttons/control_home.png"} enabled={this.hasHomeButton()} onClick={this.onHomeButtonClick} />
      );
    }
    //  FIXME replace refs with https://facebook.github.io/react/docs/top-level-api.html#react.finddomnode for BookPage
    return (
      <Hammer key={key} onSwipe={this.onSwipe}>
        <div style={pageStyle} ref="bookpage" onClick={this.onClickPage}>
          <BookHotspotMap ref="hotspotMap" {...this.props.page.hotspot} asset_manager={this.props.page.asset_manager} height={this.getPageHeight()} width={this.getPageWidth()} onHotspot={this.onHotspot} />
          <BookHotspotPhrase ref={(hotspotPhrase) => { this.hotspotPhrase = hotspotPhrase; }} {...this.props.page.styles.unread} />
          <div style={{top: 0, left: 0, position: 'absolute', height: '100%', width: clickThreshold + '%'}} onClick={this.pagePrev}></div>
          <div style={{top: 0, right: 0, position: 'absolute', height: '100%', width: clickThreshold + '%'}} onClick={this.pageNext}></div>
          {homeBackButton}
          <ImageButton id="playPauseButton" top="0" right="0" asset_manager={this.props.page.asset_manager} image={"buttons/control_"+this.state.playButton+".png"} enabled={this.hasPlayButton()} onClick={this.onPlayPauseButtonClick} />
          {extraImages}
          {extraLines}
          {this.props.children}
        </div>
      </Hammer>
    );
  },

  onHotspot(hotspot, x, y) {
    this.setState({ audioTime: 0 });
    this.audio.stop();
    this.hotspotPhrase.triggerAnimation(hotspot.text, x, y);
    this.audio.play('hotspot', hotspot.audio);
  },

  getPageHeight() {
    return Constants.Dimensions.HEIGHT;
    /*
    let dom = this.refs.bookpage.getDOMNode();
    return dom.offsetHeight || dom.clientHeight;
    */
  },

  getPageWidth() {
    return Constants.Dimensions.WIDTH;
    /*
    let dom = this.refs.bookpage.getDOMNode();
    return dom.offsetWidth || dom.clientWidth;
    */
  },

  onSwipe(e) {
    if (e.direction & HammerJS.DIRECTION_LEFT) {
      if (this.pageNext) { this.pageNext(); }
    }
    else if (e.direction & HammerJS.DIRECTION_RIGHT) {
      if (this.pagePrev) { this.pagePrev(); }
    }
  },

  hasHomeButton() {
    return this.props.page.id !== "home";
  },

  hasBackButton() {
    return this.hasHomeButton() && this.props.page.back;
  },

  hasPlayButton() {
    return !!this.props.page.pageAudio;
  },

  onBackButtonClick() {
    return BookActionCreators.changePage({ page: this.props.page.back });
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

  onPageTime(time) {
    if (time) {
      this.setState({ audioTime: time });
    }
  },

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
  pagePrev() {
    if (isNaN(this.props.page.id)) { return; }

    var newPage = this.props.page.id-1;
    BookActionCreators.changePage({ page: newPage });
  },

  pageNext() {
    if (isNaN(this.props.page.id)) { return; }

    var newPage = this.props.page.id+1;
    BookActionCreators.changePage({ page: newPage });
  },
});
module.exports = Screen;
