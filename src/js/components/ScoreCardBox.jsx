'use strict';
const React = require('react');
const createReactClass = require('create-react-class');
const ScoreCardBox = createReactClass({
  displayName: 'ScoreCardBox',

  render () {
    return (
      <canvas
        ref={node => (this.canvas = node)}
        width={this.props.style.width}
        height={this.props.style.height}
        style={this.props.style}
      />
    );
  },

  getCanvas () {
    return this.canvas;
  },

  draw () {
    let canvas = this.getCanvas();
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.props.style.color;
    ctx.font = canvas.width + 'px ' + this.props.style.fontFamily; // FIXME
    ctx.fillText(
      this.props.text,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width
    );

    /*
    let fontSize = 80;
    do {
      ctx.font = fontSize+'px ' + this.props.page.styles.unread.fontFamily;
      let size = ctx.measureText('WW');
      fontSize += 10;
      console.log(fontSize, size);
    } while (fontSize <= 120);
    */
  },

  componentDidMount () {
    this.draw();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.draw();
  }
});
module.exports = ScoreCardBox;
