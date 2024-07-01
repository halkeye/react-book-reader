import Shuffle from 'shuffle';
import GameScreen from './GameScreen.tsx';

interface Props {
  mode: 'PP' | 'WP';
}

function GamePP({ mode }: Props) {
  const [openDoor1, setOpenDoor1] = useState(null);

  const getCupboardContents = (gameParts, size) => {
    const deck = Shuffle.shuffle({ deck: gameParts });
    const array = deck.drawRandom(Math.floor(size / 2));
    if (mode === 'PP') {
      return array.concat(array).map((elm) => {
        return { key: elm.key, image: elm.image };
      });
    } else if (mode === 'WP') {
      return [
        array.map((elm) => {
          return { key: elm.key, image: elm.image };
        }),
      ]
        .flat()
        .concat(
          array.map((elm) => {
            return { key: elm.key, image: elm.text };
          })
        );
    }
    return [];
  };

  const isEndGame = () => {
    if (!this.gamescreen) {
      return false;
    }
    if (!this.gamescreen.state) {
      return false;
    }
    return (
      this.gamescreen.state.matchesScore ===
      Math.floor(this.gamescreen.numberOfDoors() / 2)
    );
  };

  const isPerfectGame = () => {
    return (
      this.gamescreen.state.triesScore ===
      Math.floor(this.gamescreen.numberOfDoors() / 2)
    );
  };

  const clickedOnDoor = (cupboard) => {
    if (!this.gamescreen.hasStarted()) {
      this.gamescreen.start();
      return false;
    }

    // Ignore open doors
    if (cupboard.isOpen()) {
      return false;
    }

    if (this.state.openDoor1 === null) {
      this.setState({ openDoor1: cupboard });
      cupboard.open();
      return true;
    }

    // Don't click on the same door
    if (this.state.openDoor1 === cupboard) {
      return false;
    }
    this.gamescreen.setState(function (previousState, currentProps) {
      return { triesScore: previousState.triesScore + 1 };
    });

    // If contents match, then yay!
    if (this.state.openDoor1.props.objectName === cupboard.props.objectName) {
      cupboard.open();
      this.gamescreen.setState(function (previousState, currentProps) {
        return { matchesScore: previousState.matchesScore + 1 };
      });
      this.setState({ openDoor1: null });
      this.gamescreen.showGoodReaction();
      return true;
    }
    this.gamescreen.showBadReaction();
    setTimeout(() => {
      this.state.openDoor1.close(false);
      cupboard.close(false);
      this.setState({ openDoor1: null });
    }, 300);
    cupboard.open();
    return true;
  };

  const properties = {
    mode: mode,
    getCupboardContents: getCupboardContents,
    isEndGame: isEndGame,
    isPerfectGame: isPerfectGame,
    clickedOnDoor: clickedOnDoor,
  };
  return <GameScreen {...properties} />;
}

export default GamePP;
