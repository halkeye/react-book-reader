'use strict';
const React = require('react');
//const mui = require('material-ui');
//let {IconButton} = mui;

let BookWord = React.createClass({
  getInitialState() {
    return {
      state: 'unread'
    };
  },

  render() {
    var style = {};
    return (
      <span style={style}>{this.props.word} </span>
    );
  },
});
module.exports = BookWord;
