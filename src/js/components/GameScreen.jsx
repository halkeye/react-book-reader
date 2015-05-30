'use strict';
const React = require('react');
const assign = require('object-assign');
const Shuffle = require('shuffle');

const BookActionCreators = require('../actions/BookActionCreators');
const Constants = require('../constants/AppConstants');

const Screen = require('./Screen.jsx');
const ScoreCardBox = require('./ScoreCardBox.jsx');
const ReactionBox = require('./ReactionBox.jsx');
const CupboardWithDoor = require('./CupboardWithDoor.jsx');
const GameOverDialog = require('./GameOverDialog.jsx');

const BookUtilities = require('../constants/BookUtilities.jsx');

const GameScreen = React.createClass({
  getDefaultProps() {
    return {
      getCupboardContents: function() { return []; },
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
    return this.state.defaultAnimation || 'neutral';
  },

  componentDidMount() {
    var promises = [];
    var gameAssets = {};
    var gameParts = [];

    this.props.page.gameBoardParts.forEach((part) => {
      let gamePart = { 'key': part.key, 'image': null, text: null };
      gameParts.push(gamePart);
      promises.push(this.props.page.asset_manager.getAsset(part.image).then((img) => {
        gamePart.image = img;
      }));
      promises.push(this.props.page.asset_manager.getAsset(part.text).then((img) => {
        gamePart.text = img;
      }));
    });
    Object.keys(this.props.page.gameAssets).forEach((assetName) => {
      let promise = this.props.page.asset_manager.getAsset(this.props.page.gameAssets[assetName]).then((img) => {
        gameAssets[assetName] = img;
      });
      promises.push(promise);
    });

    Promise.all(promises).then((parts) => {
      this.setState({ gameAssets: gameAssets, gameParts: gameParts }, () => {
        this.resetGame(this.props);
      });
    });
  },

  numberOfDoors() {
    return this.props.page.boxes.matchLocs.length;
  },

  resetGame(props) {
    let state = this.getInitialState();
    let contents = Shuffle.shuffle({ "deck": props.getCupboardContents(this.state.gameParts, this.numberOfDoors()) });
    this.props.page.boxes.matchLocs.forEach((loc, idx) => {
      let cupboard = this.refs[`cupboard_${idx}`];
      cupboard.reset();

      let content = contents.draw();
      if (!content) { return; }
      state[`cupboard_${idx}`] = content;
    });
    this.setState(state);
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
    let cupboardLocations = <div />;
    let displayBox = <div />;
    let gameOverDialog = <div />;

    if (this.state.gameAssets) {
      cupboardLocations = this.props.page.boxes.matchLocs.map((loc, idx) => {
        let style = assign(
          { 'position': 'absolute' },
          loc
        );
        let cupbardObject = this.state[`cupboard_${idx}`] || {};

        let props = {
          ref: `cupboard_${idx}`,
          key: idx,
          style: style,
          asset_manager: this.props.page.asset_manager,
          openImage: this.state.gameAssets.game_cupbard_door_open,
          closedImage: this.state.gameAssets.game_cupbard_door_closed,
          objectImage: cupbardObject.image,
          objectName: cupbardObject.key,
          onClick: this.onCupboardClick.bind(this, idx)
        };
        return <CupboardWithDoor {...props} />;
      });
    }
    if (this.props.page.boxes.displayBox && this.state.displayBox && this.state.displayBox.props.objectImage) {
      let style = assign(
        { 'position': 'absolute' },
        this.props.page.boxes.displayBox
      );
      displayBox = <img key="displaybox" style={style} src={this.state.displayBox.props.objectImage.src} />;
    }
    if (this.props.isEndGame()) {
      gameOverDialog = <GameOverDialog asset_manager={this.props.page.asset_manager} onBackGameMenu={this.onBackGameMenu} onChangeDiff={this.onChangeDiff} onPlayAgain={this.onPlayAgain} />;
    }
    return (
      <div>
        <Screen {...this.props}>
          <ScoreCardBox ref="triesBox" style={triesBoxStyle} text={BookUtilities.pad(this.state.triesScore, 2, '0')}/>
          <ScoreCardBox ref="matchBox" style={matchBoxStyle} text={BookUtilities.pad(this.state.matchesScore, 2, '0')}/>
          <ReactionBox ref="reactionBox" onComplete={this.onCompleteReaction} mode={this.state.reaction} animations={this.props.page.gameAnimations} style={reactionBoxStyle} />
          {cupboardLocations}
          {displayBox}
          {gameOverDialog}
        </Screen>
      </div>
    );
  },

  getCupboards() {
    return this.props.page.boxes.matchLocs.map((loc, idx) => {
      return this.refs[`cupboard_${idx}`];
    });
  },

  onPlayAgain() {
    this.resetGame(this.props);
  },
  onChangeDiff() {
    return BookActionCreators.changePage({ page: this.props.page.back });
  },
  onBackGameMenu() {
    return BookActionCreators.changePage({ page: 'game' });
  },

  onCupboardClick(idx) {
    var stateVar = {};
    var isClosed = this.state[`cupboard_${idx}_state`] === 'closed';
    this.props.clickedOnDoor(this.refs[`cupboard_${idx}`]);
  },

  hasStarted() {
    return this.state.started;
  },
  closeAllDoors() {
    Object.keys(this.refs).filter((key) => { return key.startsWith('cupboard_'); }).forEach((key) => {
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

  playMp3(mp3) {
    this.props.page.asset_manager.getAsset(mp3).then((asset) => {
      asset.audio.play();
    });
  },

  showGoodReaction() {
    this.setState({ reaction: 'good' });
    this.playMp3('game/game_cupbard_correct.mp3');
  },

  showBadReaction() {
    this.setState({ reaction: 'bad' });
    this.playMp3('game/game_cupbard_incorrect.mp3');
  }
});

module.exports = GameScreen;
