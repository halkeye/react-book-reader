'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');
const GameScreen = require('./GameScreen.jsx');

let GamePP = React.createClass({
  getInitialState() {
    return { openDoor1: null };
  },
  getCupboardContents(gameParts, size) {
    let deck = Shuffle.shuffle({ "deck": gameParts });
    let array = deck.drawRandom(Math.floor(size / 2));
    if (this.props.mode === 'PP') {
      return array.concat(array).map((elm) => { return { key: elm.key, image: elm.image}; });
    } else if (this.props.mode === 'WP') {
      return []
        .concat(array.map((elm) => { return { key: elm.key, image: elm.image}; }))
        .concat(array.map((elm) => { return { key: elm.key, image: elm.text}; }));
    }
    return [];
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
  clickedOnDoor(cupboard) {
    if (!this.refs.gamescreen.hasStarted()) {
      this.refs.gamescreen.start();
      return false;
    }

    // Ignore open doors
    if (cupboard.isOpen()) {
      return false;
    }

    if (this.state.openDoor1 === null) {
      this.setState({openDoor1: cupboard});
      cupboard.open();
      return true;
    }

    // Don't click on the same door
    if (this.state.openDoor1 === cupboard) {
      return false;
    }
    this.refs.gamescreen.setState(function(previousState, currentProps) {
      return { triesScore: previousState.triesScore + 1 };
    });

    // If contents match, then yay!
    if (this.state.openDoor1.props.objectName === cupboard.props.objectName) {
      cupboard.open();
      this.refs.gamescreen.setState(function(previousState, currentProps) {
        return { matchesScore: previousState.matchesScore + 1 };
      });
      this.setState({ openDoor1: null });
      this.refs.gamescreen.showGoodReaction();
      return true;
    }
    this.refs.gamescreen.showBadReaction();
    setTimeout(() => {
      this.state.openDoor1.close(false);
      cupboard.close(false);
      this.setState({ openDoor1: null });
    }, 300);
    cupboard.open();
    return true;
  },

  render() {
    let props = assign(
      {},
      this.props,
      {
        getCupboardContents: this.getCupboardContents,
        isEndGame: this.isEndGame,
        isPerfectGame: this.isPerfectGame,
        clickedOnDoor: this.clickedOnDoor
      }
    );
    return <GameScreen ref="gamescreen" {...props} />;
  }
});

module.exports = GamePP;
