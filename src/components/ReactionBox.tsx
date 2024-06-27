'use strict';
import React from 'react';
import BookStore from '../stores/BookStore';

class ReactionBox extends React.Component {
  constructor() {
    super();
    this.state = { frameNo: 0 };
  }

  static defaultProps = {
    mode: 'neutral',
  };

  stopAnimation() {
    if (this._animInterval) {
      clearTimeout(this._animInterval);
      delete this._animInterval;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      this.updateAnims(nextProps.animations[nextProps.mode]);
    }
  }

  updateAnims(anims) {
    this.stopAnimation();
    this._animInterval = setTimeout(this.getNextFrame, anims[0].nextTiming);
    this.setState({ anims: anims, frameNo: 0 });
  }

  getNextFrame() {
    let frameNo = this.state.frameNo + 1;
    if (frameNo >= this.props.animations[this.props.mode].length) {
      frameNo = 0;
      if (this.props.onComplete) {
        this.props.onComplete(this.props.mode);
      }
    }
    const frame = this.props.animations[this.props.mode][frameNo];
    this.stopAnimation();
    this._animInterval = setTimeout(this.getNextFrame, frame.nextTiming);
    this.setState({ frameNo: frameNo });
  }

  getCanvas() {
    return this.canvas;
  }

  draw() {
    if (!this.props.animations) {
      return;
    }
    const canvas = this.getCanvas();
    const context = canvas.getContext('2d');
    this.props.animations[this.props.mode][this.state.frameNo]
      .frame()
      .then((img) => {
        if (!img) {
          return;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      });
  }

  componentDidMount() {
    this.updateAnims(this.props.animations[this.props.mode]);
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
      />
    );
  }

  componentWillUnmount() {
    this.stopAnimation();
  }
}

export default ReactionBox;
