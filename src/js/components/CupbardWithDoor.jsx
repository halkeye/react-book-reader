'use strict';
const React = require('react');
const Howl = require('howler').Howl;

const CupbardWithDoor = React.createClass({
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
    let img = this.props[this.state.status + "Image"];
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
  },

  playDoorSound() {
    var sound = new Howl({ urls: ['books/Josephine/game/game_cupbard_door_sound.mp3'] }).play();
  },

  isOpen() {
    return this.state.status === 'open';
  },

  isClosed() {
    return !this.isOpen();
  },

  // Actions
  open(playSound=true) {
    this.setState({ status: 'open' });
    if (playSound === true) { this.playDoorSound(); }
  },

  close(playSound=true) {
    this.setState({ status: 'closed' });
    if (playSound === true) { this.playDoorSound(); }
  }

});
module.exports = CupbardWithDoor;

