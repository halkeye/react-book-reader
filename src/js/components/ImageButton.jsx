"use strict";
const React = require('react');
const mui = require('material-ui');
let {IconButton} = mui;

let ImageButton = React.createClass({
  render() {
    if (this.props.enabled === false) { return <div/>; }

    var buttonWidth = Math.round((112/1024)*1024);
    var buttonHeight = Math.round((112/768)*768);

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


