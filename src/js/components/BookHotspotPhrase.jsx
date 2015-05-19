'use strict';
const React = require('react');
const assign = require('object-assign');
const AnimateMixin = require('react-animate');


const BookHotspotPhrase = React.createClass({
  mixins: [AnimateMixin],
  getInitialState() {
    return {
      phrase: '',
      display: 'none'
    };
  },

  onComplete() {
    this.setState({display: 'none'});
  },

  triggerAnimation(phrase, x, y) {
    this.setState({
      display: 'block',
      phrase: phrase,
      x: x,
      y: y
    });
    this.animate(
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
  },

  render() {
    let style = assign({
      position: 'absolute',
      display: this.state.display,
      top: this.state.y,
      left: this.state.x,
      textShadow: '2px 2px 2px gray'
    }, this.getAnimatedStyle('hotspot-animation'), this.props);
    return (
      <div style={style}>{this.state.phrase}</div>
    );
  }
});
module.exports = BookHotspotPhrase;

