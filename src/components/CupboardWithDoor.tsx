'use strict';
import React from 'react';

class CupboardWithDoor extends React.Component {
  constructor() {
    super();
    this.state = { status: 'open' };
  }

  reset() {
    this.replaceState({ status: 'open' });
  }

  getCanvas() {
    return this.canvas;
  }

  draw() {
    const canvas = this.getCanvas();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (this.props.objectImage) {
      context.drawImage(this.props.objectImage, 0, 0);
    }
    const img = this.props[`${this.state.status}Image`];
    if (img) {
      context.drawImage(img, 0, 0);
    }
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate(previousProps, previousState) {
    this.draw();
  }

  render() {
    return (
      <canvas
        ref={(node) => (this.canvas = node)}
        width={this.props.style.width}
        height={this.props.style.height}
        style={this.props.style}
        onClick={this.props.onClick}
      />
    );
  }

  playDoorSound() {
    this.props.asset_manager
      .getAsset('game/game_cupbard_door_sound.mp3')
      .then((asset) => {
        asset.audio.play();
      });
  }

  isOpen() {
    return this.doorState === 'open';
  }

  isClosed() {
    return !this.isOpen();
  }

  // Actions
  open(playSound = true) {
    this.doorState = 'open';
    this.setState({ status: this.doorState });
    if (playSound === true) {
      this.playDoorSound();
    }
  }

  close(playSound = true) {
    this.doorState = 'closed';
    this.setState({ status: this.doorState });
    if (playSound === true) {
      this.playDoorSound();
    }
  }
}
export default CupboardWithDoor;
