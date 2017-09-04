'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');
const GameScreen = require('./GameScreen.jsx');

class GamePP extends React.Component {
  state = { openDoor1: null };

  getCupboardContents = (parts, size) => {
    let deck = Shuffle.shuffle({ "deck": parts });
    let array = deck.drawRandom(size);
    return array.map((elm) => { return { key: elm.key, image: elm.image}; });
  };

  isEndGame = () => {
    if (!this.refs) { return false; }
    if (!this.gamescreen) { return false; }
    if (!this.gamescreen.state) { return false; }
    return this.gamescreen.state.matchesScore === this.gamescreen.numberOfDoors();
  };

  isPerfectGame = () => {
    return this.gamescreen.state.triesScore === this.gamescreen.numberOfDoors();
  };

  updateDisplayBox = (any = false) => {
    let cupboards = any === false ? this.gamescreen.getCupboards().filter((elm) => {
      return elm.isClosed();
    }) : this.gamescreen.getCupboards();
    let cupboard = cupboards[Math.floor(Math.random() * cupboards.length)];
    this.gamescreen.setState({ displayBox: cupboard });
  };

  clickedOnDoor = (cupboard) => {
    if (!this.gamescreen.hasStarted()) {
      this.gamescreen.setState({ reaction: 'pointing', defaultAnimation: 'pointing' });
      this.updateDisplayBox(true);
      this.gamescreen.start();
      return false;
    }

    // Ignore open doors
    if (cupboard.isOpen()) { return false; }

    this.gamescreen.setState(function(previousState, currentProps) {
      return { triesScore: previousState.triesScore + 1 };
    });

    // If contents match, then yay!
    if (this.gamescreen.state.displayBox.props.objectName === cupboard.props.objectName) {
      cupboard.open();
      this.gamescreen.setState(function(previousState, currentProps) {
        return { matchesScore: previousState.matchesScore + 1 };
      });
      this.updateDisplayBox();
      this.gamescreen.showGoodReaction();
      return true;
    }
    this.gamescreen.showBadReaction();
    setTimeout(() => { cupboard.close(false); }, 300);
    cupboard.open();
    return true;
  };

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
    return <GameScreen ref={node => this.gamescreen = node} {...props} />;
  }
}

module.exports = GamePP;
