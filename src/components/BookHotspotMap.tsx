import {
  CSSProperties,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { colorToInt } from '../constants/BookUtilities';
import { BookHotspot } from '../models/Book';
import { AssetManagerContext } from '../AssetManager';

interface Props {
  height: number;
  width: number;
  hotspots: Record<number, Array<BookHotspot>>;
  mask: string;
  onHotspot(hotspot: BookHotspot, x: number, y: number): void;
}

function BookHotspotMap(properties: Props) {
  const [imageData, setImageData] = useState<ImageData>();
  const assetManager = useContext(AssetManagerContext);
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const onClickHandler = (event: MouseEvent) => {
    if (!properties.mask) {
      return;
    }

    if (!imageData) {
      return;
    }

    if (!canvasReference.current) {
      return;
    }

    const x = event.pageX - canvasReference.current.offsetLeft;
    const y = event.pageY - canvasReference.current.offsetTop;

    const canvasIndex = (x + y * properties.width) * 4;

    const color = {
      r: imageData.data[canvasIndex],
      g: imageData.data[canvasIndex + 1],
      b: imageData.data[canvasIndex + 2],
      a: imageData.data[canvasIndex + 3],
    };

    const intColor = colorToInt(color);
    const hotspots = properties.hotspots[intColor];
    if (hotspots && hotspots.length > 0) {
      const item = hotspots[Math.floor(Math.random() * hotspots.length)];
      event.preventDefault();
      event.stopPropagation();
      properties.onHotspot(item, x, y);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!properties.mask || !canvasReference.current || !assetManager) {
      return;
    }
    const canvas = canvasReference.current;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    assetManager
      .getAsset('img', properties.mask)
      .then((img) => {
        if (!(img.asset instanceof HTMLImageElement)) {
          throw new TypeError(`${properties.mask} isn't a mask`);
        }

        context.drawImage(img.asset, 0, 0);
        setImageData(
          context.getImageData(0, 0, properties.width, properties.height)
        );
        return;
      })
      .catch((error) => {
        console.error('unable to get image mask', error);
      });
  }, [assetManager, properties.height, properties.mask, properties.width]);

  if (!properties.mask) {
    return <div />;
  }

  const containerStyle: CSSProperties = {
    width: properties.width,
    height: properties.height,
    position: 'absolute',
  };
  const canvasStyle: CSSProperties = {
    display: 'none',
    visibility: 'hidden',
  };
  return (
    <div role="none" onClick={onClickHandler} style={containerStyle}>
      <canvas
        ref={canvasReference}
        height={properties.height}
        width={properties.width}
        style={canvasStyle}
      />
    </div>
  );
}

export default BookHotspotMap;
