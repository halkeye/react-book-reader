'use strict';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import AppDispatcher from '../dispatchers/AppDispatcher';
import Constants from '../constants/AppConstants';
import { FlatButton } from 'material-ui';

let isValidStyle = (obj) => {
  // if (!isDictionary(obj)) { return false; }
  if (!_.isPlainObject(obj)) {
    return false;
  }
  let stateNames = ['reading', 'read', 'unread'].sort();
  // check for extra or missing keys
  if (!_.isEqual(Object.keys(obj).sort(), stateNames)) {
    return false;
  }
  return _.every(stateNames, (state) => {
    return _.every(['fontFamily', 'fontSize', 'color'], (styleField) => {
      return !_.isNull(obj[state][styleField]);
    });
  });
};

let stylePropType = function (props, propName, component) {
  if (!isValidStyle(props)) {
    return new Error('Invalid styles!');
  }
};

class BookWord extends React.Component {
  static propTypes = {
    // http://rjzaworski.com/2015/01/putting-react-custom-proptypes-to-work
    audio: PropTypes.string,
    audioTime: PropTypes.number,
    end: PropTypes.number,
    onClick: PropTypes.func,
    start: PropTypes.number,
    styles: PropTypes.objectOf(stylePropType).isRequired,
    word: PropTypes.string.isRequired,
  };

  state = {
    state: 'unread',
  };

  getInitialProps = () => {
    return {
      styles: {},
    };
  };

  componentWillMount() {
    Object.keys(this.props.styles).forEach((style) => {
      /* Skip styles without fonts */
      if (!this.props.styles[style].fontPath) {
        return;
      }

      AppDispatcher.handleViewAction({
        type: Constants.ActionTypes.ADD_FONT,
        fontFamily: this.props.styles[style].fontFamily,
        fontPath: this.props.styles[style].fontPath,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    //    console.log('componentWillReceiveProps', nextProps);
    if (!_.isNull(this.props.start) && !_.isNull(this.props.end)) {
      if (nextProps.audioTime > this.props.end) {
        this.setState({ state: 'read' });
      } else if (nextProps.audioTime > this.props.start) {
        this.setState({ state: 'reading' });
      } else {
        this.setState({ state: 'unread' });
      }
    }
  }

  getElementStyle = () => {
    let style = Object.assign(
      {
        cursor: 'pointer',
        backgroundColor: 'transparent',
        textTransform: 'none',
        padding: '4px',
        minWidth: 'initial',
        height: 'initial',
      },
      this.props.styles[this.state.state]
    );
    style.fontSize = style.fontSize + 'px';
    delete style.fontPath;
    return style;
  };

  render() {
    let style = this.getElementStyle();

    return (
      <FlatButton style={style} onClick={this.props.onClick}>
        {' '}
        {this.props.word + ' '}{' '}
      </FlatButton>
    );
  }
}

export default BookWord;
