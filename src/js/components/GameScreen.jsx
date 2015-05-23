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
  getInitialState() {
    return {
      triesScore: 0,
      matchesScore: 0
    };
  },

  componentDidMount() {
    this.resetGame(this.props);
  },

  componentWillReceiveProps(nextProps) {
    this.resetGame(nextProps);
  },

  /* START GAME:PP*/
  getCupbardContents(size) {
    let deck = Shuffle.shuffle({ "deck": this.props.page.gameBoardParts });
    let array = deck.drawRandom(Math.floor(size / 2));
    return array.concat(array).map((elm) => { return { key: elm.key, image: elm.image}; });
  },
  isEndGame() {
    this.state.matchesScore == Math.floor(this.numberOfDoors()/2);
  },
  isPerfectGame() {
    this.state.triesScore == Math.floor(this.numberOfDoors()/2);
  },
  clickedOnDoor() {
/*
   if (!hasStarted) {
      closeAllDoors();
      hasStarted = true;
      return false;
    }

    // Ignore open doors
    if (cupbardWithDoor.isOpen()) {
      return false;
    }

    if (openDoor1 == null) {
      openDoor1 = cupbardWithDoor;
      return true;
    }

    // Don't click on the same door
    if (openDoor1 == cupbardWithDoor) {
      return false;
    }

    tryCount++;
    triesLabel.setText(String.valueOf(tryCount));


    // If contents match, then yay!
    if (openDoor1.getContent().equals(cupbardWithDoor.getContent())) {
      matchCount++;
      matchLabel.setText(String.valueOf(matchCount));
      openDoor1 = null;
      endGame();
      // Make Josephine look happy - FIXME
      showGoodReaction();
      return true;
    }

    // Bad match

    // FIXME - Josephine look unhappy
    showBadReaction();

    closingDoorsTask = new CloseDoorsTask(this);
    closingDoorsTask.execute(openDoor1,cupbardWithDoor);
    openDoor1 = null;

    return true;
*/
  },

  /* END GAME:PP*/
  numberOfDoors() {
    return this.props.page.boxes.matchLocs.length;
  },

  resetGame(props) {
    let state = this.getInitialState();
    let contents = Shuffle.shuffle({ "deck": this.getCupbardContents(this.numberOfDoors()) });
    /* this.props.cupbardContents ??? FIXME */
    this.props.page.boxes.matchLocs.map((loc, idx) => {
      let content = contents.draw();
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
      let state = this.state[`cupbard_${idx}_state`];
      let style = assign(
        { 'position': 'absolute' },
        loc
      );
      let openImage = this.props.page.gameAssets.game_cupbard_door_open;
      let closedImage = this.props.page.gameAssets.game_cupbard_door_closed;
      let objectImage = this.state[`cupbard_${idx}_image`];
      return <CupbardWithDoor key={idx} state={state} style={style} openImage={openImage} closedImage={closedImage} objectImage={objectImage} onClick={this.onCupbardClick.bind(this, idx)} />;
    });
    return (
      <div>
        <Screen {...this.props}>
          <ScoreCardBox ref="triesBox" style={triesBoxStyle} text={BookUtilities.pad(this.state.triesScore, 2, '0')}/>
          <ScoreCardBox ref="matchBox" style={matchBoxStyle} text={BookUtilities.pad(this.state.matchesScore, 2, '0')}/>
          <ReactionBox ref="reactionBox" animations={this.props.page.gameAnimations} style={reactionBoxStyle} />
          {cupboardLocations}
        </Screen>
      </div>
    );
  },

  onCupbardClick(idx) {
    var stateVar = {};
    if (this.state[`cupbard_${idx}_state`] === 'closed') {
      stateVar[`cupbard_${idx}_state`] = 'open';
    } else {
      stateVar[`cupbard_${idx}_state`] = 'closed';
    }
    this.setState(stateVar);
  }
});

module.exports = GameScreen;
