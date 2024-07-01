import Shuffle from 'shuffle';
import Screen from './Screen.tsx';
import ScoreCardBox from './ScoreCardBox.tsx';
import ReactionBox from './ReactionBox.tsx';
import CupboardWithDoor from './CupboardWithDoor.tsx';
import GameOverDialog from './GameOverDialog.tsx';
import { BookGame } from '../models/Book.ts';
import { Component } from 'react';

interface Properties {
  getCupboardContents: () => Array<{ key: string; image: string }>;
  clickedOnDoor: (isOpen: boolean) => boolean;
  isEndGame: () => boolean;
  page: BookGame;
}

interface State {
  started: boolean;
  triesScore: number;
  matchesScore: number;
  defaultAnimation?: Reaction;
  gameParts: Array<GamePart>;
  reaction: Reaction;
}

type Reaction = 'bad' | 'good' | 'neutral';

interface GamePart {
  key: string;
  image?: string;
  text?: string;
}

class GameScreen extends Component<Properties, State> {
  startingState() {
    return {
      started: false,
      triesScore: 0,
      matchesScore: 0,
      reaction: this.getDefaultReaction(),
    };
  }

  constructor(properties: Properties) {
    super(properties);
    this.state = {
      gameParts: [],
      ...this.startingState(),
    };
  }

  getDefaultReaction() {
    return this.state.defaultAnimation || 'neutral';
  }

  componentDidMount() {
    const promises = [];
    const gameAssets = {};
    const gameParts: Array<GamePart> = [];

    for (const part of this.props.page.gameBoardParts) {
      const gamePart = { key: part.key };
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
            text={this.state.triesScore.padStart('0', 2)}
          />
          <ScoreCardBox
            style={matchBoxStyle}
            text={this.state.matchesScore.padStart('0', 2)}
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
    const [, setBookPage] = useAtom(bookPageAtom);
    setBookPage(properties.page.back);
  }

  onBackGameMenu() {
    const [, setBookPage] = useAtom(bookPageAtom);
    setBookPage('game');
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
    const doors = Object.entries(this).filter(([key]) => {
      return key.startsWith('cupboard_');
    });
    for (const [, door] of doors) {
      door.close(false);
    }
  }

  start() {
    this.closeAllDoors();
    this.setState({ started: true });
  }

  onCompleteReaction(reaction: Reaction) {
    const defaultMode = this.getDefaultReaction();
    if (reaction !== defaultMode) {
      this.setState({ reaction: defaultMode });
    }
  }

  playMp3(mp3) {
    this.props.page.asset_manager.getAsset('audio', mp3).then((asset) => {
      if (asset.asset instanceof AssetManagerAudioType) {
        asset.asset.audio.play();
      }
      return;
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
