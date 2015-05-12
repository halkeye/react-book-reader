"use strict";
const React = require('react');
const AppConstants = require('../constants/AppConstants.js');
const mui = require('material-ui');
let {IconButton} = mui;

let ImageButton = React.createClass({
  render() {
    if (this.props.enabled === false) { return <div/>; }

    var buttonWidth = AppConstants.Dimensions.BUTTON_WIDTH; // FIXME
    var buttonHeight = AppConstants.Dimensions.BUTTON_HEIGHT;

    var style = {
      position: "absolute",
      height: buttonHeight+'px',
      width: buttonWidth+'px',
      backgroundSize: 'contain',
      backgroundColor: 'rgba(0,0,0,0)',
      backgroundImage: "url(" + this.props.image + ")",
      border: 'none'
    };
    ['top','left','right','bottom'].forEach((field) => {
      if (this.props[field]) { style[field] = this.props[field]; }
    });
    return (
      <IconButton style={style} onClick={this.props.onClick}></IconButton>
    );
  },
});
module.exports = ImageButton;


