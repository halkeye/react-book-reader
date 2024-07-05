import arrayShuffle from 'array-shuffle';
import { GameScreen, GamePart } from './GameScreen.tsx';
import { useCallback, useRef, useState } from 'react';
import { BookGame } from '../models/Book.ts';
import CupboardWithDoor from './CupboardWithDoor.tsx';

interface Props {
  mode: 'PP' | 'WP';
  page: BookGame;
}

function GamePP({ mode, page }: Props) {
  const [openDoor1, setOpenDoor1] = useState<CupboardWithDoor>();
  const gamescreen = useRef<GameScreen | null>(null);

  const getCupboardContents = (
    gameParts: Array<GamePart>,
    size: number
  ): Array<GamePart> => {
    const shuffledGameParts = arrayShuffle(gameParts).slice(
      0,
      Math.floor(size / 2)
    );
    if (mode === 'PP') {
      return [...shuffledGameParts, ...shuffledGameParts].map((elm) => {
        return { key: elm.key, image: elm.image };
      });
    } else if (mode === 'WP') {
      return [
        ...shuffledGameParts.map((elm) => {
          return { key: elm.key, image: elm.image };
        }),
        ...shuffledGameParts.map((elm) => {
          return { key: elm.key, image: elm.text };
        }),
      ];
    }
    return [];
  };

  const isEndGame = useCallback(() => {
    if (!gamescreen?.current) {
      return false;
    }

    if (!gamescreen?.current?.state) {
      return false;
    }

    return (
      gamescreen?.current?.state.matchesScore ===
      Math.floor(gamescreen?.current?.numberOfDoors() / 2)
    );
  }, []);

  const isPerfectGame = () => {
    if (!gamescreen?.current) {
      return false;
    }
    return (
      gamescreen.current.state.triesScore ===
      Math.floor(gamescreen.current.numberOfDoors() / 2)
    );
  };

  const clickedOnDoor = (cupboard: CupboardWithDoor) => {
    if (!gamescreen?.current?.hasStarted()) {
      gamescreen?.current?.start();
      return false;
    }

    // Ignore open doors
    if (cupboard.isOpen()) {
      return false;
    }

    if (openDoor1 === null) {
      setOpenDoor1(cupboard);
      cupboard.open();
      return true;
    }

    // Don't click on the same door
    if (openDoor1 === cupboard) {
      return false;
    }
    gamescreen?.current?.setState(function (previousState) {
      return { triesScore: previousState.triesScore + 1 };
    });

    // If contents match, then yay!
    if (openDoor1?.props.objectName === cupboard.props.objectName) {
      cupboard.open();
      gamescreen?.current?.setState(function (previousState) {
        return { matchesScore: previousState.matchesScore + 1 };
      });
      setOpenDoor1(undefined);
      gamescreen?.current?.showGoodReaction();
      return true;
    }
    gamescreen?.current?.showBadReaction();
    setTimeout(() => {
      openDoor1?.close(false);
      cupboard.close(false);
      setOpenDoor1(undefined);
    }, 300);
    cupboard.open();
    return true;
  };

  const properties = {
    page: page,
    getCupboardContents: getCupboardContents,
    isEndGame: isEndGame,
    isPerfectGame: isPerfectGame,
    clickedOnDoor: clickedOnDoor,
  };
  return <GameScreen ref={gamescreen} {...properties} />;
}

export default GamePP;
