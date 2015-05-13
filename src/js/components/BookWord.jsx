'use strict';
const React = require('react');
const assign = require('object-assign');
//const mui = require('material-ui');
//let {IconButton} = mui;
//
let isDefined = (variable) => {
  return typeof variable !== 'undefined';
};

let BookWord = React.createClass({
  propTypes: {
    children: React.PropTypes.string.isRequired
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
    return (
      <span style={style}>{this.props.children} </span>
    );
  },
});
module.exports = BookWord;
