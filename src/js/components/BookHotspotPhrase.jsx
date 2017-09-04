'use strict';
const React = require('react');
const createReactClass = require('create-react-class');
const assign = require('object-assign');

class Animate {
  static getAnimatedStyle() {
    return {};
  }
  static animate(args) {
    console.log('animate', ...args);
  }
}

export default class BookHotspotPhrase extends React.Component {
  constructor() {
    super();
    this.state = {
      phrase: '',
      display: 'none'
    };
  }

  onComplete() {
    this.setState({display: 'none'});
  }

  triggerAnimation(phrase, x, y) {
    this.setState({
      display: 'block',
      phrase: phrase,
      x: x,
      y: y
    });
    Animate.animate.call(this,
      'hotspot-animation', // animation name
      { transform: 'scale(0.1)' }, // initial style
      { transform: 'scale(1)' }, // final style
      700, // animation duration (in ms)
      {
        // other options
        easing: 'linear',
        onComplete: this.onComplete
      }
    );
  }

  render() {
    let style = assign({
      position: 'absolute',
      display: this.state.display,
      top: this.state.y,
      left: this.state.x,
      textShadow: '2px 2px 2px gray'
    }, Animate.getAnimatedStyle.call(this, 'hotspot-animation'), this.props);
    return (
      <div style={style}>{this.state.phrase}</div>
    );
  }
}
