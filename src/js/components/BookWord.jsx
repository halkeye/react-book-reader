'use strict';
const React = require('react');
const assign = require('object-assign');
const _ = require('lodash');

const AppDispatcher = require('../dispatchers/AppDispatcher.js');
const Constants = require('../constants/AppConstants');

const mui = require('material-ui');
let {FlatButton} = mui;

let isValidStyle = (obj) => {
  //if (!isDictionary(obj)) { return false; }
  if (!_.isPlainObject(obj)) { return false; }
  let stateNames = ['reading', 'read', 'unread'].sort();
  // check for extra or missing keys
  if (!_.isEqual(Object.keys(obj).sort(), stateNames)) { return false; }
  return _.every(stateNames, (state) => {
    return _.every(['fontFamily', 'fontSize', 'color'], (styleField) => {
      return !_.isNull(obj[state][styleField]);
    });
  });
};

let stylePropType = function (props, propName, component) {
  if (!isValidStyle(props)) { return new Error('Invalid styles!'); }
};

let BookWord = React.createClass({
  propTypes: {
    // http://rjzaworski.com/2015/01/putting-react-custom-proptypes-to-work
    audio: React.PropTypes.string,
    audioTime: React.PropTypes.number,
    end: React.PropTypes.number,
    onClick: React.PropTypes.func,
    start: React.PropTypes.number,
    styles: React.PropTypes.objectOf(stylePropType).isRequired,
    word: React.PropTypes.string.isRequired
  },

  getInitialProps() {
    return {
      styles: {}
    };
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
        fontPath: this.props.styles[style].fontPath
      });
    });

  },

  componentWillReceiveProps: function(nextProps) {
    if (_.isNull(this.props.start) && _.isNull(this.props.end)) {
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
    var style = assign({
      cursor: 'pointer',
      backgroundColor: 'transparent',
      textTransform: 'none',
      padding: '4px',
      minWidth: 'initial'
    }, this.props.styles[this.state.state]);
    style.fontSize = style.fontSize + 'px';
    delete style.fontPath;

    return (
      <FlatButton style={style} onClick={this.props.onClick}> {this.props.word + " "} </FlatButton>
    );
  }
});
module.exports = BookWord;
