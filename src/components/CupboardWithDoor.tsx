import { Component, createRef, CSSProperties, MouseEventHandler } from 'react';
import { AssetManagerAudioType, AssetManagerContext } from '../AssetManager';

interface Props {
  style: CSSProperties;
  objectImage?: HTMLImageElement;
  objectName?: string;
  openImage?: HTMLImageElement;
  closedImage?: HTMLImageElement;
  onClick?: MouseEventHandler<HTMLCanvasElement>;
}

interface State {
  status: 'open' | 'closed';
}

class CupboardWithDoor extends Component<Props, State> {
  static contextType = AssetManagerContext;
  declare context: React.ContextType<typeof AssetManagerContext>;

  canvas = createRef<HTMLCanvasElement>();

  constructor(properties: Props) {
    super(properties);
    this.state = { status: 'open' };
  }

  reset() {
    this.setState({ status: 'open' });
  }

  draw() {
    const canvas = this.canvas.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (this.props.objectImage) {
      context.drawImage(this.props.objectImage, 0, 0);
    }
    const img = this.props[`${this.state.status}Image`];
    if (img) {
      context.drawImage(img, 0, 0);
    }
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.draw();
  }

  render() {
    return (
      <canvas
        ref={this.canvas}
        width={this.props.style.width}
        height={this.props.style.height}
        style={this.props.style}
        onClick={this.props.onClick}
      />
    );
  }

  playDoorSound() {
    this.context
      .getAsset('audio', 'game/game_cupbard_door_sound.mp3')
      .then((asset) => {
        if (asset.asset instanceof AssetManagerAudioType && asset.asset.audio) {
          asset.asset.audio.play();
        }
        return asset;
      })
      .catch((error) => {
        console.error('unable to load audio', error);
      });
  }

  isOpen() {
    return this.state.status === 'open';
  }

  isClosed() {
    return !this.isOpen();
  }

  // Actions
  open(playSound = true) {
    this.setState({ status: 'open' });
    if (playSound === true) {
      this.playDoorSound();
    }
  }

  close(playSound = true) {
    this.setState({ status: 'closed' });
    if (playSound === true) {
      this.playDoorSound();
    }
  }
}
export default CupboardWithDoor;
