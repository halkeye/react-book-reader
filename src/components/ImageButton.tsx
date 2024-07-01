import AppConstants from '../constants/AppConstants';
import IconButton from '@mui/material/IconButton';
import { CSSProperties, useContext } from 'react';
import { AssetManagerContext } from '../AssetManager';

interface Props {
  image: string;
  enabled?: boolean;

  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  top?: CSSProperties['top'];
  left?: CSSProperties['left'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
  onClick: () => void;
}

const ImageButton = (properties: Props) => {
  const assetManager = useContext(AssetManagerContext);
  if (properties.enabled === false) {
    return <div />;
  }

  const buttonWidth = properties.width || AppConstants.Dimensions.BUTTON_WIDTH; // FIXME
  const buttonHeight =
    properties.height || AppConstants.Dimensions.BUTTON_HEIGHT;
  const img = assetManager.getAssetSrc(properties.image);

  const style: CSSProperties = {
    position: 'absolute',
    height: `${buttonHeight}px`,
    width: `${buttonWidth}px`,
    backgroundSize: '100% 100%',
    backgroundColor: 'rgba(0,0,0,0)',
    backgroundImage: `url(${img})`,
    border: 'none',
  };

  for (const field of ['top', 'left', 'right', 'bottom']) {
    if (field in properties) {
      // @ts-expect-error - I don't know how to make this work in typescript - it doesn't match top inside of style and Props
      style[field] = properties[field];
    }
  }

  return <IconButton style={style} onClick={properties.onClick} />;
};

export default ImageButton;
