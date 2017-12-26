'use strict';
import { Motion, spring } from 'react-motion';

const React = require('react');
const assign = require('object-assign');

export default class BookHotspotPhrase extends React.Component {
  constructor () {
    super();
    this.state = {
      phrase: '',
      display: 'none'
    };
  }

  onComplete () {
    this.setState({ display: 'none' });
  }

  triggerAnimation (phrase, x, y) {
    this.setState({
      display: 'block',
      phrase: phrase,
      x: x,
      y: y
    });
  }

  render () {
    if (this.state.display === 'none') {
      return <div />;
    }

    let style = assign(
      {
        position: 'absolute',
        display: this.state.display,
        top: this.state.y,
        left: this.state.x,
        textShadow: '2px 2px 2px gray'
      },
      this.props
    );

    return (
      <div>
        <Motion
          defaultStyle={{ opacity: 0, scale: 0 }}
          style={{ opacity: 1, scale: spring(1) }}
          onRest={this.onComplete.bind(this)}
        >
          {value => {
            return (
              <div
                style={assign({}, style, {
                  opacity: value.opacity,
                  transform: `scale(${value.scale})`
                })}
              >
                {this.state.phrase}
              </div>
            );
          }}
        </Motion>
      </div>
    );
  }
}
