'use strict';
const React = require('react');
const BookStore = require('../stores/BookStore');

const ReactionBox = React.createClass({
  getInitialState() { return { frameNo: 0 }; },
  getDefaultProps() { return { 'mode': 'neutral' }; },

  componentWillReceiveProps: function(nextProps) {
    let animName = nextProps.mode || 'neutral';
    if (!this.cache) { this.cache = {}; }
    if (this.cache[animName]) {
      this.updateAnims(this.cache[animName]);
    } else {
      BookStore.getAnimFile(this.props.assetBaseUrl, nextProps.mode).then((anims) => {
        this.cache[animName] = anims;
        this.updateAnims(this.cache[animName]);
      });
    }
  },

  updateAnims(anims) {
    if (this.state.animInterval) { clearInterval(this.state.animInterval); }
    let animInterval = setTimeout( this.getNextFrame, anims[0].nextTiming );
    this.setState({ anims: anims, frameNo: 0 });
  },

  getNextFrame() {
    let frameNo = (this.state.frameNo+1) % this.state.anims.length;
    let frame = this.state.anims[frameNo];

    let animInterval = setTimeout( this.getNextFrame, frame.nextTiming );
    this.setState({ frameNo: frameNo, animInterval: animInterval });
  },

  getCanvas() {
    return this.refs.canvas.getDOMNode();
  },
  draw() {
    if (!this.state.anims) { return; }
    let canvas = this.getCanvas();
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.state.anims[this.state.frameNo].frame, 0, 0);
  },

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
    this.draw();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.draw();
  },

  render() {
    return <canvas ref="canvas" width={this.props.style.width} height={this.props.style.height} style={this.props.style}></canvas>;
  }

});

module.exports = ReactionBox;
