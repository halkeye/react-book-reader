import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimFrame } from '../constants/BookUtilities';
import { AssetManagerAudioType, AssetManagerContext } from '../AssetManager';

interface ReactionBoxProps {
  animations?: { [mode: string]: Array<AnimFrame> };
  mode?: 'good' | 'bad' | 'neutral';
  style: React.CSSProperties;
  onComplete?: (mode: string) => void;
}

const ReactionBox: React.FC<ReactionBoxProps> = ({
  animations,
  mode = 'neutral',
  style,
  onComplete,
}) => {
  const assetManager = useContext(AssetManagerContext);
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout>();
  const [frameNo, setFrameNo] = useState(0);

  const stopAnimation = useCallback(() => {
    if (animationInterval) {
      clearTimeout(animationInterval);
      setAnimationInterval(undefined);
    }
  }, [animationInterval]);

  useEffect(() => {
    let mp3 = '';
    if (mode == 'good') {
      mp3 = 'game/game_cupbard_correct.mp3';
    } else if (mode == 'bad') {
      mp3 = 'game/game_cupbard_incorrect.mp3';
    }
    if (mp3) {
      assetManager
        .getAsset('audio', mp3)
        .then((asset) => {
          if (
            asset.asset instanceof AssetManagerAudioType &&
            asset.asset.audio
          ) {
            asset.asset.audio.play();
          }
          return;
        })
        .catch((error) => {
          console.error('error playing audio:', error);
        });
    }
  }, [assetManager, mode]);

  const getNextFrame = useCallback(() => {
    if (!animations || !animations[mode]) return;

    const nextFrameNo = (frameNo + 1) % animations[mode].length;
    const frame = animations[mode][nextFrameNo];

    stopAnimation();
    setAnimationInterval(setTimeout(getNextFrame, frame.nextTiming));
    setFrameNo(nextFrameNo);

    if (nextFrameNo === 0 && onComplete) {
      onComplete(mode);
    }
  }, [animations, frameNo, mode, onComplete, stopAnimation]);

  const updateAnims = useCallback(
    (anims?: Array<AnimFrame>) => {
      stopAnimation();
      if (anims) {
        setAnimationInterval(setTimeout(getNextFrame, anims[0].nextTiming));
        setFrameNo(0);
      }
    },
    [getNextFrame, stopAnimation]
  );

  useEffect(() => {
    updateAnims(animations?.[mode]);
    if (
      !animations ||
      !animations[mode] ||
      !animations[mode][frameNo] ||
      !animations[mode][frameNo].frame
    ) {
      return;
    }
    const draw = async () => {
      const canvas = canvasReference.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const asset = await animations[mode][frameNo].frame;
      if (!asset || !asset.asset) {
        throw new Error('No Image');
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(asset.asset as HTMLImageElement, 0, 0);
    };
    draw().catch((error) => {
      console.error("ReactionBox can't play animation frame:", error);
    });

    return () => stopAnimation();
  }, [updateAnims, animations, mode, stopAnimation, frameNo]);

  return (
    <canvas
      ref={canvasReference}
      width={style.width as number}
      height={style.height as number}
      style={style}
    />
  );
};

export default ReactionBox;
