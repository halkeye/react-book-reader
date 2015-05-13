'use strict';
const React = require('react');
const assign = require('object-assign');
const AppDispatcher = require('../dispatchers/AppDispatcher.js');
const Constants = require('../constants/AppConstants');

//const mui = require('material-ui');
//let {IconButton} = mui;
//
let isDefined = (variable) => {
  return typeof variable !== 'undefined';
};

let BookWord = React.createClass({
  propTypes: {
    word: React.PropTypes.string.isRequired
//    children: React.PropTypes.string.isRequired
  },

  getInitialProps() {
    return {
      styles: {}
    }
  },

  getInitialState() {
    return {
      state: 'unread'
    };
  },

  componentWillMount() {
    Object.keys(this.props.styles).forEach((style) => {
      /* Skip styles without fonts */
      if (!this.props.styles[style].fontPath) { return; }

      AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.ADD_FONT,
        fontFamily: this.props.styles[style].fontFamily,
        fontPath: this.props.styles[style].fontPath,
      });
    });

  },

  componentWillReceiveProps: function(nextProps) {
    if (isDefined(this.props.start) && isDefined(this.props.end)) {
      if (nextProps.audioTime > this.props.end) {
        this.setState({state: 'read'});
      } else if (nextProps.audioTime > this.props.start) {
        this.setState({state: 'reading'});
      } else {
        this.setState({state: 'unread'});
      }
    }
  },

  render() {
    var style = assign({}, this.props.styles[this.state.state]);
    style.fontSize = style.fontSize + 'px';
    delete style.fontPath;

    return <span style={style}>{this.props.word + " "}</span>;
  },
});
module.exports = BookWord;
