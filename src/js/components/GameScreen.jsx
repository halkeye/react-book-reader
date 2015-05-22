'use strict';
const React = require('react');
const assign = require('object-assign');

const Constants = require('../constants/AppConstants');
const Screen = require('./Screen.jsx');
const ScoreCardBox = require('./ScoreCardBox.jsx');
const BookUtilities = require('../constants/BookUtilities.jsx');

const GameScreen = React.createClass({
  getInitialState() {
    return {
      triesScore: 0
    };
  },
/*  componentDidMount() {
    setInterval(() => {
      this.setState({triesScore: this.state.triesScore+10});
    }, 1000);
  },*/
  render() {
    let triesBoxStyle = assign(
      { 'position': 'absolute' },
      this.props.page.boxes.tries
    );
    let matchBoxStyle = assign(
      { 'position': 'absolute' },
      this.props.page.boxes.match
    );
    return (
      <div>
        <Screen {...this.props}>
          <ScoreCardBox ref="triesBox" style={triesBoxStyle} text={BookUtilities.pad(this.state.triesScore, 2, '0')}/>
          <ScoreCardBox ref="matchBox" style={matchBoxStyle} text='00'/>
        </Screen>
      </div>
    );
  }
});

module.exports = GameScreen;
