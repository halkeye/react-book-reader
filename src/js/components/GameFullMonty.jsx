'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');
const GameScreen = require('./GameScreen.jsx');

let GamePP = React.createClass({
  getInitialState() {
    return { openDoor1: null };
  },
  getCupboardContents(size) {
    let deck = Shuffle.shuffle({ "deck": this.props.page.gameBoardParts });
    let array = deck.drawRandom(size);
    return array.map((elm) => { return { key: elm.key, image: elm.image}; });
  },
  isEndGame() {
    if (!this.refs) { return false; }
    if (!this.refs.gamescreen) { return false; }
    if (!this.refs.gamescreen.state) { return false; }
    return this.refs.gamescreen.state.matchesScore === this.refs.gamescreen.numberOfDoors();
  },
  isPerfectGame() {
    return this.refs.gamescreen.state.triesScore === this.refs.gamescreen.numberOfDoors();
  },
  updateDisplayBox(any = false) {
    let cupboards = any === false ? this.refs.gamescreen.getCupboards().filter((elm) => {
      return elm.isClosed();
    }) : this.refs.gamescreen.getCupboards();
    let cupboard = cupboards[Math.floor(Math.random() * cupboards.length)];
    this.refs.gamescreen.setState({ displayBox: cupboard });
  },
  clickedOnDoor(cupboard) {
    if (!this.refs.gamescreen.hasStarted()) {
      this.refs.gamescreen.setState({ reaction: 'pointing', defaultAnimation: 'pointing' });
      this.updateDisplayBox(true);
      this.refs.gamescreen.start();
      return false;
    }

    // Ignore open doors
    if (cupboard.isOpen()) { return false; }

    this.refs.gamescreen.setState(function(previousState, currentProps) {
      return { triesScore: previousState.triesScore + 1 };
    });

    // If contents match, then yay!
    if (this.refs.gamescreen.state.displayBox.props.objectName === cupboard.props.objectName) {
      cupboard.open();
      this.refs.gamescreen.setState(function(previousState, currentProps) {
        return { matchesScore: previousState.matchesScore + 1 };
      });
      this.updateDisplayBox();
      this.refs.gamescreen.showGoodReaction();
      return true;
    }
    // FIXME - Josephine look unhappy
    this.refs.gamescreen.showBadReaction();
    setTimeout(() => { cupboard.close(false); }, 300);
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
/*
  private void updateDisplayBox()
  {
    if (this.displayBox == null) return;
    this.displayBox.setVisibility(View.VISIBLE);

    Collections.shuffle(this.doors);
    Iterator<CupboardWithDoor> doorsIter = this.doors.iterator();

    while (doorsIter.hasNext())
    {
      CupboardWithDoor door = doorsIter.next();
      if (door.isOpen()) continue;
      // Ignore the door that is already opened/selected
      if (door.getContent().equals(mDisplayBoxContents)) continue;

      mDisplayBoxContents = door.getContent();
      this.displayBox.setImageBitmap(door.getImage(true));
      break;
    }
  }

  @Override
  public boolean clickedOnDoor(final CupboardWithDoor cupboardWithDoor) {

    openDoor1 = cupboardWithDoor;

    tryCount++;
    triesLabel.setText(String.valueOf(tryCount));

    // If contents match, then yay!
    if (openDoor1.getContent().equals(mDisplayBoxContents)) {
      matchCount++;
      matchLabel.setText(String.valueOf(matchCount));
      openDoor1 = null;
      updateDisplayBox();
      endGame();
      // Make Josephine look happy
      showGoodReaction();
      return true;
    }

    // Bad match

    // Josephine look unhappy
    showBadReaction();
    closingDoorsTask = new CloseDoorsTask(this);
    closingDoorsTask.execute(openDoor1,cupboardWithDoor);
      openDoor1 = null;

    return true;
  }

  @Override
  protected void initializeGameAnimations() {
    this.mPointingAnim = new GameDisplayAnimation(this, "pointing");
    super.initializeGameAnimations();
  }
}
*/
