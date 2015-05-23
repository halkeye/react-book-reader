'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');
const GameScreen = require('./GameScreen.jsx');

let GamePP = React.createClass({
  getCupbardContents(size) {
    let deck = Shuffle.shuffle({ "deck": this.props.page.gameBoardParts });
    let array = deck.drawRandom(Math.floor(size / 2));
    return array.concat(array).map((elm) => { return { key: elm.key, image: elm.image}; });
  },
  isEndGame() {
    return this.ref.gamescreen.state.matchesScore === Math.floor(this.ref.gamescreen.numberOfDoors() / 2);
  },
  isPerfectGame() {
    return this.ref.gamescreen.state.triesScore === Math.floor(this.ref.gamescreen.numberOfDoors() / 2);
  },
  clickedOnDoor(cupbard) {
    /*if (!this.ref.gamescreen.hasStarted()) {
      this.ref.gamescreen.startGame();
      return false;
    }*/

    if (cupbard.isClosed()) {
      console.log('door is already closed');
      cupbard.open();
      return false;
    }

    cupbard.close();

    return true;
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
