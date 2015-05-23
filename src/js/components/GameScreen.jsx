'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');

const Constants = require('../constants/AppConstants');

const Screen = require('./Screen.jsx');
const ScoreCardBox = require('./ScoreCardBox.jsx');
const ReactionBox = require('./ReactionBox.jsx');
const CupbardWithDoor = require('./CupbardWithDoor.jsx');

const BookUtilities = require('../constants/BookUtilities.jsx');

const GameScreen = React.createClass({
  getDefaultProps() {
    return {
      getCupbardContents: function() { return []; },
      clickedOnDoor: function(isOpen) { return true; }
    };
  },
  getInitialState() {
    return {
      started: false,
      triesScore: 0,
      matchesScore: 0
    };
  },

  getDefaultReaction() {
    // FIXME - full monty has pointing animation when game has started
    return 'neutral';
  },

  componentDidMount() {
    this.resetGame(this.props);
  },

  /*
  componentWillReceiveProps(nextProps) {
    // FIXME - only change when things change
    this.resetGame(nextProps);
  },
  */

  numberOfDoors() {
    return this.props.page.boxes.matchLocs.length;
  },

  resetGame(props) {
    let state = this.getInitialState();
    let contents = Shuffle.shuffle({ "deck": props.getCupbardContents(this.numberOfDoors()) });
    this.props.page.boxes.matchLocs.map((loc, idx) => {
      let cupbard = this.refs[`cupbard_${idx}`];
      cupbard.reset();

      let content = contents.draw();
      if (!content) { return; }
      state[`cupbard_${idx}_image`] = content.image;
      state[`cupbard_${idx}_name`] = content.key;

    });
    this.replaceState(state);
  },

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
    let cupboardLocations = this.props.page.boxes.matchLocs.map((loc, idx) => {
      let style = assign(
        { 'position': 'absolute' },
        loc
      );
      let openImage = this.props.page.gameAssets.game_cupbard_door_open;
      let closedImage = this.props.page.gameAssets.game_cupbard_door_closed;
      let objectImage = this.state[`cupbard_${idx}_image`];
      let objectName = this.state[`cupbard_${idx}_name`];

      let props = {
        ref: `cupbard_${idx}`,
        key: idx,
        style: style,
        openImage: openImage,
        closedImage: closedImage,
        objectImage: objectImage,
        objectName: objectName,
        onClick: this.onCupbardClick.bind(this, idx)
      };
      return <CupbardWithDoor {...props} />;
    });
    return (
      <div>
        <Screen {...this.props}>
          <ScoreCardBox ref="triesBox" style={triesBoxStyle} text={BookUtilities.pad(this.state.triesScore, 2, '0')}/>
          <ScoreCardBox ref="matchBox" style={matchBoxStyle} text={BookUtilities.pad(this.state.matchesScore, 2, '0')}/>
          <ReactionBox ref="reactionBox" onComplete={this.onCompleteReaction} mode={this.state.reaction} animations={this.props.page.gameAnimations} style={reactionBoxStyle} />
          {cupboardLocations}
        </Screen>
      </div>
    );
  },

  onCupbardClick(idx) {
    var stateVar = {};
    var isClosed = this.state[`cupbard_${idx}_state`] === 'closed';
    this.props.clickedOnDoor(this.refs[`cupbard_${idx}`]);
  },

  hasStarted() {
    return this.state.started;
  },
  closeAllDoors() {
    Object.keys(this.refs).filter((key) => { return key.startsWith('cupbard_'); }).forEach((key) => {
      this.refs[key].close(false);
    });
  },
  start() {
    this.closeAllDoors();
    this.setState({ started: true });
  },

  onCompleteReaction(reaction) {
    let defaultMode = this.getDefaultReaction();
    if (reaction !== defaultMode) {
      this.setState({ reaction: defaultMode });
    }
  },

  showGoodReaction() {
    this.setState({ reaction: 'good' });
  },

  showBadReaction() {
    this.setState({ reaction: 'bad' });
  }
});

module.exports = GameScreen;
