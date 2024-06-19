'use strict';
const React = require('react');
const AppConstants = require('../constants/AppConstants.js');
const mui = require('material-ui');
let { IconButton } = mui;

class ImageButton extends React.Component {
  render () {
    if (this.props.enabled === false) {
      return <div />;
    }

    let buttonWidth = this.props.width || AppConstants.Dimensions.BUTTON_WIDTH; // FIXME
    let buttonHeight =
      this.props.height || AppConstants.Dimensions.BUTTON_HEIGHT;
    let img = this.props.asset_manager.getAssetSrc(this.props.image);

    let style = {
      position: 'absolute',
      height: buttonHeight + 'px',
      width: buttonWidth + 'px',
      backgroundSize: '100% 100%',
      backgroundColor: 'rgba(0,0,0,0)',
      backgroundImage: 'url(' + img + ')',
      border: 'none'
    };
    ['top', 'left', 'right', 'bottom'].forEach(field => {
      if (this.props[field]) {
        style[field] = this.props[field];
      }
    });
    return <IconButton style={style} onClick={this.props.onClick} />;
  }
}

module.exports = ImageButton;
