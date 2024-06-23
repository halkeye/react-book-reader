'use strict';
import AppConstants from '../constants/AppConstants';
import IconButton from '@mui/material/IconButton';
import AssetManager from '../AssetManager';

interface Props {
  image: string;
  enabled?: boolean;
  assetManager: AssetManager;

  width?: number;
  height?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  onClick: () => void;
}

const ImageButton = (props: Props) => {
  if (props.enabled === false) {
    return <div />;
  }

  const buttonWidth = props.width || AppConstants.Dimensions.BUTTON_WIDTH; // FIXME
  const buttonHeight = props.height || AppConstants.Dimensions.BUTTON_HEIGHT;
  const img = props.assetManager.getAssetSrc(props.image);

  const style: React.CSSProperties = {
    position: 'absolute',
    height: `${buttonHeight}px`,
    width: `${buttonWidth}px`,
    backgroundSize: '100% 100%',
    backgroundColor: 'rgba(0,0,0,0)',
    backgroundImage: `url(${img})`,
    border: 'none',
  };

  for (const field of ['top', 'left', 'right', 'bottom']) {
    if (field in props) {
      // @ts-expect-error - I don't know how to make this work in typescript - it doesn't match top inside of style and Props
      style[field] = props[field];
    }
  }

  return <IconButton style={style} onClick={props.onClick} />;
};

export default ImageButton;
