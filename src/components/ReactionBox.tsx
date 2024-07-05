import { useContext, useEffect, useMemo, useRef } from 'react';
import { AnimFrame } from '../constants/BookUtilities';
import { AssetManagerAudioType, AssetManagerContext } from '../AssetManager';

export type Reaction = 'bad' | 'good' | 'neutral';

interface ReactionBoxProps {
  animations?: { [mode: string]: Array<AnimFrame> };
  mode: Reaction;
  style: React.CSSProperties;
  onComplete?: (reaction: Reaction) => void;
}

export function ReactionBox({
  animations,
  mode,
  onComplete,
  style,
}: ReactionBoxProps) {
  const assetManager = useContext(AssetManagerContext);
  const canvasReference = useRef<HTMLCanvasElement>(null);

  const modeAnimations = useMemo(() => {
    if (!animations || !animations[mode] || animations[mode].length === 0) {
      return;
    }
    return animations[mode];
  }, [animations, mode]);

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

  useEffect(() => {
    if (!modeAnimations) {
      return;
    }

    const canvas = canvasReference.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let setTimeoutId: number = 0;
    let frameNo = -1;
    let frame = modeAnimations[0];

    // Check if null context has been replaced on component mount
    if (context) {
      //Our draw came here
      const render = () => {
        if (!modeAnimations) {
          return;
        }

        const nextFrameNo = (frameNo + 1) % modeAnimations.length;
        if (frameNo != -1 && nextFrameNo == 0 && onComplete) {
          onComplete(mode);
        }
        frame = modeAnimations[nextFrameNo];
        frameNo = nextFrameNo;

        const draw = async () => {
          const asset = await frame.frame;
          if (!asset || !asset.asset) {
            throw new Error('No Image');
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(asset.asset as HTMLImageElement, 0, 0);
          setTimeoutId = setTimeout(
            render,
            frame.nextTiming
          ) as unknown as number;
        };
        draw().catch((error) => {
          console.error("ReactionBox can't play animation frame:", error);
        });
      };
      render();
    }
    return () => {
      console.log('clearing animation');
      clearTimeout(setTimeoutId);
    };
  }, [modeAnimations, onComplete, mode]);

  return (
    <canvas
      ref={canvasReference}
      width={style.width}
      height={style.height}
      style={style}
    />
  );
}

export default ReactionBox;
