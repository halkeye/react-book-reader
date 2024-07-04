import { Component, createRef, CSSProperties } from 'react';

interface Props {
  style: CSSProperties;
  text: string;
}

class ScoreCardBox extends Component<Props> {
  canvas = createRef<HTMLCanvasElement>();

  render() {
    return (
      <canvas
        ref={this.canvas}
        width={this.props.style.width}
        height={this.props.style.height}
        style={{
          ...this.props.style,
        }}
      />
    );
  }

  draw() {
    const canvas = this.canvas.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.textBaseline = 'top';
    context.textAlign = 'center';
    if (this.props.style.color) {
      context.fillStyle = this.props.style.color.toString();
    }
    context.font = `${canvas.height + 15}px ${this.props.style.fontFamily}`; // FIXME
    context.fillText(this.props.text, canvas.width / 2, 0, canvas.width);

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

  componentDidUpdate() {
    this.draw();
  }
}
export default ScoreCardBox;
