const React = require('react');

//const invariant = require('react/lib/invariant');
const BookUtilities = require('../constants/BookUtilities.jsx');

const BookHotspotMap = React.createClass({
  getInitialProps() {
    return {
      height: 0,
      width: 0,
      hotspots: []
    };
  },

  getCanvas() {
    return this.refs.canvas.getDOMNode();
  },

  onClickImage(ev) {
    if (!this.props.image) { return; }
    let rect = this.getCanvas().getBoundingClientRect();
    let x = ev.clientX - rect.left;
    let y = ev.clientY - rect.top;

    let canvasIndex = (x + y * this.props.width) * 4;

    let color = {
      r: this.imageData.data[canvasIndex],
      g: this.imageData.data[canvasIndex+1],
      b: this.imageData.data[canvasIndex+2],
      a: this.imageData.data[canvasIndex+3]
    };

    let intColor = BookUtilities.colorToInt(color);
    let hotspots = this.props.hotspots[intColor];
    if (hotspots && hotspots.length) {
      var item = hotspots[Math.floor(Math.random() * hotspots.length)];
      this.props.onHotspot(item, x, y);
    }
  },

  draw() {
    if (!this.props.image) { return; }
    let ctx = this.getCanvas().getContext('2d');
    let imageObj = new Image();
    imageObj.onload = () => {
      ctx.drawImage(imageObj, 0, 0);
      this.imageData = ctx.getImageData(0, 0, this.props.width, this.props.height);
    };
    imageObj.src = this.props.image;
  },

  componentDidMount() {
    this.draw();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.draw();
  },

  render() {
    if (!this.props.image) { return <div></div>; }
    let surfaceStyle = {
      width: this.props.width,
      height: this.props.height,
      position: 'absolute',
      display: 'none'
    };
    return (
      <canvas ref="canvas" height={this.props.height} width={this.props.width} style={surfaceStyle} onClick={this.onClickImage}></canvas>
    );
  }
});
module.exports = BookHotspotMap;
