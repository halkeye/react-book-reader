'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import Shuffle from 'shuffle';
import { choosePage } from '../actions';
import Screen from './Screen.jsx';
import ScoreCardBox from './ScoreCardBox.jsx';
import ReactionBox from './ReactionBox.jsx';
import CupboardWithDoor from './CupboardWithDoor.jsx';
import GameOverDialog from './GameOverDialog.jsx';
import BookUtilities from '../constants/BookUtilities.jsx';

class GameScreen extends React.Component {
  static defaultProps = {
    getCupboardContents() {
      return [];
    },
    clickedOnDoor(isOpen) {
      return true;
    },
    isEndGame() {
      throw new Error('overwrite please');
    },
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    getCupboardContents: PropTypes.func.isRequired,
    clickedOnDoor: PropTypes.func.isRequired,
    isEndGame: PropTypes.func.isRequired,
    page: PropTypes.object,
  };

  startingState() {
    return {
      started: false,
      triesScore: 0,
      matchesScore: 0,
    };
  }

  constructor() {
    super();
    this.state = this.startingState();
  }

  getDefaultReaction() {
    return this.state.defaultAnimation || 'neutral';
  }

  componentDidMount() {
    const promises = [];
    const gameAssets = {};
    const gameParts = [];

    for (const part of this.props.page.gameBoardParts) {
      const gamePart = { key: part.key, image: null, text: null };
      gameParts.push(gamePart);
      promises.push(
        this.props.page.asset_manager.getAsset(part.image).then((img) => {
          gamePart.image = img;
        })
      );
      promises.push(
        this.props.page.asset_manager.getAsset(part.text).then((img) => {
          gamePart.text = img;
        })
      );
    }
    for (const assetName of Object.keys(this.props.page.gameAssets)) {
      const promise = this.props.page.asset_manager
        .getAsset(this.props.page.gameAssets[assetName])
        .then((img) => {
          gameAssets[assetName] = img;
        });
      promises.push(promise);
    }

    Promise.all(promises).then((parts) => {
      this.setState({ gameAssets, gameParts }, () => {
        this.resetGame(this.props);
      });
    });
  }

  numberOfDoors() {
    return this.props.page.boxes.matchLocs.length;
  }

  resetGame(properties) {
    const state = this.startingState();
    const contents = Shuffle.shuffle({
      deck: properties.getCupboardContents(
        this.state.gameParts,
        this.numberOfDoors()
      ),
    });
    for (const [index, loc] of this.props.page.boxes.matchLocs.entries()) {
      const cupboard = this[`cupboard_${index}`];
      cupboard.reset();

      const content = contents.draw();
      if (!content) {
        continue;
      }
      state[`cupboard_${index}`] = content;
    }
    this.setState(state);
  }

  render() {
    const triesBoxStyle = Object.assign(
      { position: 'absolute' },
      this.props.page.boxes.tries
    );
    const matchBoxStyle = Object.assign(
      { position: 'absolute' },
      this.props.page.boxes.match
    );
    const reactionBoxStyle = Object.assign(
      { position: 'absolute' },
      this.props.page.boxes.reactionBox
    );
    let cupboardLocations = <div />;
    let displayBox = <div />;
    let gameOverDialog = <div />;

    if (this.state.gameAssets) {
      cupboardLocations = this.props.page.boxes.matchLocs.map((loc, index) => {
        const style = Object.assign({ position: 'absolute' }, loc);
        const cupbardObject = this.state[`cupboard_${index}`] || {};

        const properties = {
          ref: (node) => (this[`cupboard_${index}`] = node),
          key: index,
          style,
          asset_manager: this.props.page.asset_manager,
          openImage: this.state.gameAssets.game_cupbard_door_open,
          closedImage: this.state.gameAssets.game_cupbard_door_closed,
          objectImage: cupbardObject.image,
          objectName: cupbardObject.key,
          onClick: this.onCupboardClick.bind(this, index),
        };
        return <CupboardWithDoor key={index} {...properties} />;
      });
    }
    if (
      this.props.page.boxes.displayBox &&
      this.state.displayBox &&
      this.state.displayBox.props.objectImage
    ) {
      const style = Object.assign(
        { position: 'absolute' },
        this.props.page.boxes.displayBox
      );
      displayBox = (
        <img
          key="displaybox"
          style={style}
          src={this.state.displayBox.props.objectImage.src}
        />
      );
    }
    if (this.props.isEndGame()) {
      gameOverDialog = (
        <GameOverDialog
          asset_manager={this.props.page.asset_manager}
          onBackGameMenu={this.onBackGameMenu}
          onChangeDiff={this.onChangeDiff}
          onPlayAgain={this.onPlayAgain}
        />
      );
    }
    return (
      <div>
        <Screen {...this.props}>
          <ScoreCardBox
            style={triesBoxStyle}
            text={BookUtilities.pad(this.state.triesScore, 2, '0')}
          />
          <ScoreCardBox
            style={matchBoxStyle}
            text={BookUtilities.pad(this.state.matchesScore, 2, '0')}
          />
          <ReactionBox
            onComplete={this.onCompleteReaction}
            mode={this.state.reaction}
            animations={this.props.page.gameAnimations}
            style={reactionBoxStyle}
          />
          {cupboardLocations}
          {displayBox}
          {gameOverDialog}
        </Screen>
      </div>
    );
  }

  getCupboards() {
    return this.props.page.boxes.matchLocs.map((loc, index) => {
      return this[`cupboard_${index}`];
    });
  }

  onPlayAgain() {
    this.resetGame(this.props);
  }

  onChangeDiff() {
    return this.props.dispatch(choosePage(this.props.page.back));
  }

  onBackGameMenu() {
    return this.props.dispatch(choosePage('game'));
  }

  onCupboardClick(index) {
    // FIXME - let stateVar = {};
    // FIXME - let isClosed = this.state[`cupboard_${idx}_state`] === 'closed';
    this.props.clickedOnDoor(this[`cupboard_${index}`]);
  }

  hasStarted() {
    return this.state.started;
  }

  closeAllDoors() {
    for (const key of Object.keys(this)
      .filter((key) => {
        return key.startsWith('cupboard_');
      })) {
        this[key].close(false);
      }
  }

  start() {
    this.closeAllDoors();
    this.setState({ started: true });
  }

  onCompleteReaction(reaction) {
    const defaultMode = this.getDefaultReaction();
    if (reaction !== defaultMode) {
      this.setState({ reaction: defaultMode });
    }
  }

  playMp3(mp3) {
    this.props.page.asset_manager.getAsset(mp3).then((asset) => {
      asset.audio.play();
    });
  }

  showGoodReaction() {
    this.setState({ reaction: 'good' });
    this.playMp3('game/game_cupbard_correct.mp3');
  }

  showBadReaction() {
    this.setState({ reaction: 'bad' });
    this.playMp3('game/game_cupbard_incorrect.mp3');
  }
}

export default GameScreen;
