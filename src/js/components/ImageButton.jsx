"use strict";
const React = require('react');
const AppConstants = require('../constants/AppConstants.js');
const mui = require('material-ui');
let {IconButton} = mui;

let ImageButton = React.createClass({
  render() {
    if (this.props.enabled === false) { return <div/>; }

    var buttonWidth = this.props.width || AppConstants.Dimensions.BUTTON_WIDTH; // FIXME
    var buttonHeight = this.props.height || AppConstants.Dimensions.BUTTON_HEIGHT;
    var img = this.props.asset_manager.getAsset(this.props.image).src;

    var style = {
      position: "absolute",
      height: buttonHeight+'px',
      width: buttonWidth+'px',
      backgroundSize: '100% 100%',
      backgroundColor: 'rgba(0,0,0,0)',
      backgroundImage: "url(" + img + ")",
      border: 'none'
    };
    ['top', 'left', 'right', 'bottom'].forEach((field) => {
      if (this.props[field]) { style[field] = this.props[field]; }
    });
    return (
      <IconButton style={style} onClick={this.props.onClick}></IconButton>
    );
  }
});
module.exports = ImageButton;


