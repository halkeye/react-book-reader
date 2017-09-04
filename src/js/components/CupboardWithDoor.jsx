'use strict';
const React = require('react');

const CupboardWithDoor = React.createClass({
  getInitialState() {
    return { 'status': 'open' };
  },

  reset() {
    this.replaceState(this.getInitialState());
  },

  getCanvas() {
    return this.refs.canvas.getDOMNode();
  },

  draw() {
    let canvas = this.getCanvas();
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.props.objectImage) {
      ctx.drawImage(this.props.objectImage, 0, 0);
    }
    let img = this.props[this.state.status + "Image"];
    if (img) {
      ctx.drawImage(img, 0, 0);
    }
  },

  componentDidMount() {
    this.draw();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.draw();
  },

  render() {
    return <canvas ref="canvas" width={this.props.style.width} height={this.props.style.height} style={this.props.style} onClick={this.props.onClick}></canvas>;
  },

  playDoorSound() {
    this.props.asset_manager.getAsset('game/game_cupbard_door_sound.mp3').then((asset) => {
      asset.audio.play();
    });
  },

  isOpen() {
    return this.doorState === 'open';
  },

  isClosed() {
    return !this.isOpen();
  },

  // Actions
  open(playSound=true) {
    this.doorState = 'open';
    this.setState({ status: this.doorState });
    if (playSound === true) { this.playDoorSound(); }
  },

  close(playSound=true) {
    this.doorState = 'closed';
    this.setState({ status: this.doorState });
    if (playSound === true) { this.playDoorSound(); }
  }

});
module.exports = CupboardWithDoor;

