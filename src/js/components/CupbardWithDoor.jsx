'use strict';
const React = require('react');
const CupbardWithDoor = React.createClass({
  getDefaultProps() { return { 'state': 'open' }; },

  getCanvas() {
    return this.refs.canvas.getDOMNode();
  },
  draw() {
    let img = this.props[this.props.state + "Image"];
    if (!img) { return; }

    let canvas = this.getCanvas();
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.props.objectImage) {
      ctx.drawImage(this.props.objectImage, 0, 0);
    }
    ctx.drawImage(img, 0, 0);
  },

  componentDidMount() {
    this.draw();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.draw();
  },

  render() {
    return <canvas ref="canvas" width={this.props.style.width} height={this.props.style.height} style={this.props.style} onClick={this.props.onClick}></canvas>;
  }
});
module.exports = CupbardWithDoor;

