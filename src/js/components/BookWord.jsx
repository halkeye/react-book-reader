'use strict';
const React = require('react');
//const mui = require('material-ui');
//let {IconButton} = mui;

let BookWord = React.createClass({
  propTypes: {
    children: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      state: 'unread'
    };
  },

  render() {
    var style = {};
    return (
      <span style={style}>{this.props.children} </span>
    );
  },
});
module.exports = BookWord;
