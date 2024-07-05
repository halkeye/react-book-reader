import arrayShuffle from 'array-shuffle';
import Screen from './Screen.tsx';
import ScoreCardBox from './ScoreCardBox.tsx';
import { ReactionBox, Reaction } from './ReactionBox.tsx';
import CupboardWithDoor from './CupboardWithDoor.tsx';
import GameOverDialog from './GameOverDialog.tsx';
import { BookGame } from '../models/Book.ts';
import { Component, createRef, CSSProperties, ReactNode } from 'react';
import { AssetManagerContext } from '../AssetManager.ts';
import { useAtom } from 'jotai';
import { bookPageAtom } from '../atoms.ts';

interface Properties {
  getCupboardContents: (
    gameParts: Array<GamePart>,
    size: number
  ) => Array<GamePart>;
  clickedOnDoor: (cupboard: CupboardWithDoor) => boolean;
  isEndGame: () => boolean;
  page: BookGame;
}

interface State {
  started: boolean;
  triesScore: number;
  matchesScore: number;
  defaultAnimation?: Reaction;
  cupboardContents: Array<GamePart>;
  displayBox?: CupboardWithDoor;
  gameParts: Array<GamePart>;
  gameAssets: Record<string, HTMLImageElement>;
  reaction: Reaction;
}

export interface GamePart {
  key: string;
  image?: HTMLImageElement;
  text?: HTMLImageElement;
}

export class GameScreen extends Component<Properties, State> {
  static contextType = AssetManagerContext;
  declare context: React.ContextType<typeof AssetManagerContext>;

  cupboards: Array<CupboardWithDoor | null> = [];

  startingState(): Omit<Omit<State, 'gameParts'>, 'gameAssets'> {
    return {
      started: false,
      triesScore: 0,
      matchesScore: 0,
      reaction: this.getDefaultReaction(),
      cupboardContents: [],
    };
  }

  constructor(properties: Properties) {
    super(properties);
    this.state = {
      gameParts: [],
      gameAssets: {},
      ...this.startingState(),
    };
  }

  getDefaultReaction() {
    return this?.state?.defaultAnimation || 'neutral';
  }

  componentDidMount() {
    const promises = [];
    const gameAssets: Record<string, HTMLImageElement> = {};
    const gameParts: Array<GamePart> = [];

    for (const part of this.props.page.gameBoardParts) {
      const gamePart: GamePart = { key: part.key };
      gameParts.push(gamePart);
      promises.push(
        this.context.getAsset('img', part.image).then((img) => {
          if (img.asset && img.asset instanceof HTMLImageElement) {
            gamePart.image = img.asset;
          }
          return img;
        }),
        this.context.getAsset('img', part.text).then((img) => {
          if (img.asset && img.asset instanceof HTMLImageElement) {
            gamePart.text = img.asset;
          }
          return img;
        })
      );
    }
    for (const assetName of Object.keys(this.props.page.gameAssets)) {
      promises.push(
        this.context
          .getAsset('img', this.props.page.gameAssets[assetName])
          .then((img) => {
            if (img.asset && img.asset instanceof HTMLImageElement) {
              gameAssets[assetName] = img.asset;
            }
            return img;
          })
      );
    }

    Promise.all(promises)
      .then(() => {
        this.setState({ gameAssets, gameParts }, () => {
          this.resetGame(this.props);
        });
        return;
      })
      .catch((error) => {
        console.error('Unable to load game assets', error);
        throw error;
      });
  }

  numberOfDoors() {
    return this.props.page.boxes.matchLocs.length;
  }

  resetGame(properties: Properties) {
    const state = this.startingState();
    const contents = arrayShuffle(
      properties.getCupboardContents(this.state.gameParts, this.numberOfDoors())
    );
    for (const [index] of this.props.page.boxes.matchLocs.entries()) {
      const cupboard = this.cupboards[index];
      if (!cupboard) {
        continue;
      }
      cupboard.reset();

      const content = contents.shift();
      if (!content) {
        continue;
      }
      state.cupboardContents[index] = content;
    }
    this.setState(state);
  }

  render() {
    const triesBoxStyle: CSSProperties = {
      position: 'absolute',
      ...(this.props.page.boxes.tries as CSSProperties),
    };
    const matchBoxStyle: CSSProperties = {
      position: 'absolute',
      ...(this.props.page.boxes.match as CSSProperties),
    };
    const reactionBoxStyle: CSSProperties = {
      position: 'absolute',
      ...(this.props.page.boxes.reactionBox as CSSProperties),
    };
    let cupboardLocations: Array<ReactNode> = [];
    let displayBox = <div />;
    let gameOverDialog = <div />;

    if (this.state.gameAssets) {
      cupboardLocations = this.props.page.boxes.matchLocs.map((loc, index) => {
        const style: CSSProperties = { position: 'absolute', ...loc };
        const cupboardObject: GamePart =
          this.state.cupboardContents[index] || {};

        return (
          <CupboardWithDoor
            key={index}
            ref={(node) => {
              this.cupboards[index] = node;
            }}
            style={style}
            openImage={this.state.gameAssets.game_cupbard_door_open}
            closedImage={this.state.gameAssets.game_cupbard_door_closed}
            objectImage={cupboardObject.image}
            objectName={cupboardObject.key?.toString()}
            onClick={this.onCupboardClick.bind(this, index)}
          />
        );
      });
    } else {
      console.log('no game assets');
    }
    if (
      this.props.page.boxes.displayBox &&
      this.state.displayBox &&
      this.state.displayBox.props.objectImage
    ) {
      const style: CSSProperties = {
        position: 'absolute',
        ...this.props.page.boxes.displayBox,
      };
      displayBox = (
        <img
          key="displaybox"
          alt="box containing object to match to"
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
            text={this.state.triesScore.toString().padStart(2, '0')}
          />
          <ScoreCardBox
            style={matchBoxStyle}
            text={this.state.matchesScore.toString().padStart(2, '0')}
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
    return this.props.page.boxes.matchLocs.map((_loc, index) => {
      return this.cupboards[index];
    });
  }

  onPlayAgain() {
    this.resetGame(this.props);
  }

  onChangeDiff() {
    const [, setBookPage] = useAtom(bookPageAtom);
    setBookPage(this.props.page.back);
  }

  onBackGameMenu() {
    const [, setBookPage] = useAtom(bookPageAtom);
    setBookPage('game');
  }

  onCupboardClick = (index: number) => {
    // FIXME - let stateVar = {};
    // FIXME - let isClosed = this.state[`cupboard_${idx}_state`] === 'closed';
    if (this.cupboards[index]) {
      this.props.clickedOnDoor(this.cupboards[index]);
    }
  };

  hasStarted = () => {
    return this.state.started;
  };

  closeAllDoors = () => {
    for (const door of this.cupboards) {
      if (door) {
        door.close(false);
      }
    }
  };

  start = () => {
    this.closeAllDoors();
    this.setState({ started: true });
  };

  onCompleteReaction = (reaction: Reaction) => {
    const defaultMode = this.getDefaultReaction();
    if (reaction !== defaultMode) {
      this.setState({ reaction: defaultMode });
    }
  };

  showGoodReaction = () => {
    this.setState({ reaction: 'good' });
  };

  showBadReaction = () => {
    this.setState({ reaction: 'bad' });
  };
}

export default GameScreen;
