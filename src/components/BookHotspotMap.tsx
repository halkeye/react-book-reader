import React, { CSSProperties } from 'react';
import { colorToInt } from '../constants/BookUtilities';
import AssetManager from '../AssetManager';
import { BookHotspot } from '../models/Book';

interface Props {
  height: number;
  width: number;
  hotspots: Array<BookHotspot>;
  image: string;
  assetManager: AssetManager;
  onHotspot(hotspot: BookHotspot, x: number, y: number): void;
}

interface State {}

export default class BookHotspotMap extends React.Component<Props, State> {
  public static defaultProps = {
    height: 0,
    width: 0,
    hotspots: [],
  };

  canvas: React.RefObject<HTMLCanvasElement>;
  imageData?: ImageData;

  constructor(properties: Props) {
    super(properties);
    this.canvas = React.createRef();
  }

  getCanvas() {
    return this.canvas.current;
  }

  onClickImage(x: number, y: number) {
    if (!this.props.image) {
      return false;
    }
    if (!this.imageData) {
      return false;
    }
    const canvasIndex = (x + y * this.props.width) * 4;

    const color = {
      r: this.imageData.data[canvasIndex],
      g: this.imageData.data[canvasIndex + 1],
      b: this.imageData.data[canvasIndex + 2],
      a: this.imageData.data[canvasIndex + 3],
    };

    const intColor = colorToInt(color);
    const hotspots = this.props.hotspots[intColor];
    if (hotspots && hotspots.length > 0) {
      const item = hotspots[Math.floor(Math.random() * hotspots.length)];
      this.props.onHotspot(item, x, y);
      return true;
    }
    return false;
  }

  draw() {
    if (!this.props.image) {
      return;
    }
    const canvas = this.getCanvas();
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    this.props.assetManager.getAsset(this.props.image).then((img) => {
      context.drawImage(img, 0, 0);
      this.imageData = context.getImageData(
        0,
        0,
        this.props.width,
        this.props.height
      );
    });
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate(previousProps, previousState) {
    this.draw();
  }

  render() {
    if (!this.props.image) {
      return <div />;
    }
    const onClickImage = () => {};

    const surfaceStyle: CSSProperties = {
      width: this.props.width,
      height: this.props.height,
      position: 'absolute',
      display: 'none',
    };
    return (
      <canvas
        ref={this.canvas}
        height={this.props.height}
        width={this.props.width}
        style={surfaceStyle}
        onClick={onClickImage}
      />
    );
  }
}
