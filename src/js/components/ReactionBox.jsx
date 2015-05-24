'use strict';
const React = require('react');
const BookStore = require('../stores/BookStore');

const ReactionBox = React.createClass({
  getInitialState() { return { frameNo: 0 }; },
  getDefaultProps() { return { 'mode': 'neutral' }; },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      this.updateAnims(nextProps.animations[nextProps.mode]);
    }
  },

  updateAnims(anims) {
    if (this.state.animInterval) { clearInterval(this.state.animInterval); }
    let animInterval = setTimeout( this.getNextFrame, anims[0].nextTiming );
    this.setState({ anims: anims, frameNo: 0 });
  },

  getNextFrame() {
    let frameNo = this.state.frameNo+1;
    if (frameNo >= this.props.animations[this.props.mode].length) {
      frameNo = 0;
      if (this.props.onComplete) { this.props.onComplete(this.props.mode); }
    }
    let frame = this.props.animations[this.props.mode][frameNo];
    let animInterval = setTimeout( this.getNextFrame, frame.nextTiming );
    this.setState({ frameNo: frameNo, animInterval: animInterval });
  },

  getCanvas() {
    return this.refs.canvas.getDOMNode();
  },
  draw() {
    if (!this.props.animations) { return; }
    let canvas = this.getCanvas();
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.props.animations[this.props.mode][this.state.frameNo].frame, 0, 0);
  },

  componentDidMount() {
    this.updateAnims(this.props.animations[this.props.mode]);
    this.draw();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.draw();
  },

  render() {
    return <canvas ref="canvas" width={this.props.style.width} height={this.props.style.height} style={this.props.style}></canvas>;
  },

  componentWillUnmount() {
    if (this.state.animInterval) { clearInterval(this.state.animInterval); }
  }

});

module.exports = ReactionBox;
