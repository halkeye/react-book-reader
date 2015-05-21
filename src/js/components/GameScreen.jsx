'use strict';
const React = require('react');
const Constants = require('../constants/AppConstants');
const Screen = require('./Screen.jsx');

const GameScreen = React.createClass({
  render() {
    console.log(this.props);
    return (
      <div>
        <Screen {...this.props} />
      </div>
    );
  }
});

module.exports = GameScreen;
