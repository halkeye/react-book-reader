import ImageButton from './ImageButton.tsx';
import { AssetManagerContext } from '../AssetManager.ts';
import { useContext } from 'react';

interface Properties {
  onPlayAgain: () => void;
  onChangeDiff: () => void;
  onBackGameMenu: () => void;
}

function GameOverDialog({
  onPlayAgain,
  onChangeDiff,
  onBackGameMenu,
}: Properties) {
  const assetManager = useContext(AssetManagerContext);
  return (
    <div
      style={{
        backgroundImage: `url(${assetManager.getAssetSrc('pages/gameEnd.png')})`,
        position: 'absolute',
        top: '0',
        left: '90',
        height: '684',
        width: '883',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            backgroundImage: `url(${assetManager.getAssetSrc(
              'game/gameEnd_title.png'
            )})`,
            position: 'absolute',
            top: '200',
            left: '215',
            height: '50',
            width: '469',
          }}
        />
        <ImageButton
          top="282px"
          left="190px"
          height="95"
          width="538"
          image={'buttons/gameEnd_playAgain.png'}
          onClick={onPlayAgain}
        />
        <ImageButton
          top="382px"
          left="190px"
          height="95"
          width="538"
          image={'buttons/gameEnd_changeDiff.png'}
          onClick={onChangeDiff}
        />
        <ImageButton
          top="482px"
          left="190px"
          height="95"
          width="538"
          image={'buttons/gameEnd_backGameMenu.png'}
          onClick={onBackGameMenu}
        />
      </div>
    </div>
  );
}

export default GameOverDialog;
