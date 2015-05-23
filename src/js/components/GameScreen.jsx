'use strict';
const React = require('react');
const assign = require('object-assign');

const Constants = require('../constants/AppConstants');
const Screen = require('./Screen.jsx');
const ScoreCardBox = require('./ScoreCardBox.jsx');
const BookUtilities = require('../constants/BookUtilities.jsx');


const BookStore = require('../stores/BookStore');
const ReactionBox = React.createClass({
  getInitialState() { return { frameNo: 0 }; },
  getDefaultProps() { return { 'mode': 'neutral' }; },

  componentWillReceiveProps: function(nextProps) {
    let animName = nextProps.mode || 'neutral';
    if (!this.cache) { this.cache = {}; }
    if (this.cache[animName]) {
      this.updateAnims(this.cache[animName]);
    } else {
      BookStore.getAnimFile(this.props.assetBaseUrl, nextProps.mode).then((anims) => {
        this.cache[animName] = anims;
        this.updateAnims(this.cache[animName]);
      });
    }
  },

  updateAnims(anims) {
    if (this.state.animInterval) { clearInterval(this.state.animInterval); }
    let animInterval = setTimeout( this.getNextFrame, anims[0].nextTiming );
    this.setState({ anims: anims, frameNo: 0 });
  },

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  },

  getNextFrame() {
    let frameNo = (this.state.frameNo+1) % this.state.anims.length;
    let frame = this.state.anims[frameNo];

    let animInterval = setTimeout( this.getNextFrame, frame.nextTiming );
    this.setState({ frameNo: frameNo, animInterval: animInterval });
  },

  render() {
    let style = assign(
      {
        'backgroundSize': '100% 100%'
      },
      this.props.style
    );
    if (this.state.anims) {
      style.backgroundImage = 'url(' + this.state.anims[this.state.frameNo].frame + ')';
    }
    return <div style={style}></div>;
  }
});
const GameScreen = React.createClass({
  getInitialState() {
    return {
      triesScore: 0
    };
  },
/*  componentDidMount() {
    setInterval(() => {
      this.setState({triesScore: this.state.triesScore+10});
    }, 1000);
  },*/
  render() {
    let triesBoxStyle = assign(
      { 'position': 'absolute' },
      this.props.page.boxes.tries
    );
    let matchBoxStyle = assign(
      { 'position': 'absolute' },
      this.props.page.boxes.match
    );
    let reactionBoxStyle = assign(
      { 'position': 'absolute' },
      this.props.page.boxes.reactionBox
    );
    console.log('gameBoardParts', this.props.page.gameBoardParts);
    return (
      <div>
        <Screen {...this.props}>
          <ScoreCardBox ref="triesBox" style={triesBoxStyle} text={BookUtilities.pad(this.state.triesScore, 2, '0')}/>
          <ScoreCardBox ref="matchBox" style={matchBoxStyle} text='00'/>
          <ReactionBox ref="reactionBox" assetBaseUrl={this.props.page.assetBaseUrl} style={reactionBoxStyle} />
        </Screen>
      </div>
    );
  }
});

module.exports = GameScreen;
