'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');
const GameScreen = require('./GameScreen.jsx');

let GamePP = React.createClass({
  getInitialState() {
    return { openDoor1: null };
  },
  getCupbardContents(size) {
    let deck = Shuffle.shuffle({ "deck": this.props.page.gameBoardParts });
    let array = deck.drawRandom(Math.floor(size / 2));
    return array.concat(array).map((elm) => { return { key: elm.key, image: elm.image}; });
  },
  isEndGame() {
    if (!this.refs) { return false; }
    if (!this.refs.gamescreen) { return false; }
    if (!this.refs.gamescreen.state) { return false; }
    return this.refs.gamescreen.state.matchesScore === Math.floor(this.refs.gamescreen.numberOfDoors() / 2);
  },
  isPerfectGame() {
    return this.refs.gamescreen.state.triesScore === Math.floor(this.refs.gamescreen.numberOfDoors() / 2);
  },
  clickedOnDoor(cupbard) {
    if (!this.refs.gamescreen.hasStarted()) {
      this.refs.gamescreen.start();
      return false;
    }

    // Ignore open doors
    if (cupbard.isOpen()) {
      return false;
    }

    if (this.state.openDoor1 === null) {
      this.setState({openDoor1: cupbard});
      cupbard.open();
      return true;
    }

    // Don't click on the same door
    if (this.state.openDoor1 === cupbard) {
      return false;
    }
    this.refs.gamescreen.setState(function(previousState, currentProps) {
      return { triesScore: previousState.triesScore + 1 };
    });

    // If contents match, then yay!
    if (this.state.openDoor1.props.objectName === cupbard.props.objectName) {
      cupbard.open();
      this.refs.gamescreen.setState(function(previousState, currentProps) {
        return { matchesScore: previousState.matchesScore + 1 };
      });
      this.setState({ openDoor1: null });
      this.refs.gamescreen.showGoodReaction();
      return true;
    }
    // FIXME - Josephine look unhappy
    this.refs.gamescreen.showBadReaction();
    setTimeout(() => {
      this.state.openDoor1.close(false);
      cupbard.close(false);
      this.setState({ openDoor1: null });
    }, 300);
    cupbard.open();
    return true;
  },

  render() {
    let props = assign(
      {},
      this.props,
      {
        getCupbardContents: this.getCupbardContents,
        isEndGame: this.isEndGame,
        isPerfectGame: this.isPerfectGame,
        clickedOnDoor: this.clickedOnDoor
      }
    );
    return <GameScreen ref="gamescreen" {...props} />;
  }
});

module.exports = GamePP;
