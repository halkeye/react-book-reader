/*global describe:false, it:false beforeEach: false*/
'use strict';
var expect = require('chai').expect;
var React = require('react/addons');
var BookWord = require('../../../src/js/components/BookWord.jsx');
var TestUtils = React.addons.TestUtils;
var should = require('should');

describe('BookWord', function() {
  beforeEach(function() {
    var styles = {
      'unread': {
        color: 'red',
        fontPath: '',
        fontFamily: ''
      },
      'read': {
        color: 'blue',
        fontPath: '',
        fontFamily: ''
      },
      'reading': {
        color: 'green',
        fontPath: '',
        fontFamily: ''
      }

    };

    var TestParent = React.createFactory(React.createClass({
      getInitialState() {
        return { audioTime: 0.0 };
      },
      render() {
        return <BookWord ref="sot" word="gav" audioTime={this.state.audioTime} styles={styles} start={1} end={3} />;
      }
    }));

    this.parent = TestUtils.renderIntoDocument(TestParent()); //eslint-disable-line new-cap
    this.sot = this.parent.refs.sot;
  });
  it('confirm default state is unread', function() {
    this.sot.state.state.should.eql("unread");
    this.sot.getElementStyle().color.should.eql('red');
  });

  it('confirm time before start is unread', function() {
    this.parent.setState({ audioTime: 0.1 });
    this.sot.state.state.should.eql("unread");
    this.sot.getElementStyle().color.should.eql('red');
  });

  it('confirm time between start and end is reading', function() {
    this.parent.setState({ audioTime: 1.1 });
    this.sot.state.state.should.eql("reading");
    this.sot.getElementStyle().color.should.eql('green');
  });

  it('confirm time after end is read', function() {
    this.parent.setState({ audioTime: 3.1 });
    this.sot.state.state.should.eql("read");
    this.sot.getElementStyle().color.should.eql('blue');
  });
});
