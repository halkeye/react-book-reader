'use strict';
import React from 'react';

class ScoreCardBox extends React.Component {
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

  getCanvas() {
    return this.canvas;
  }

  draw() {
    const canvas = this.getCanvas();
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = this.props.style.color;
    context.font = `${canvas.width}px ${this.props.style.fontFamily}`; // FIXME
    context.fillText(
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
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate(previousProps, previousState) {
    this.draw();
  }
}
export default ScoreCardBox;
