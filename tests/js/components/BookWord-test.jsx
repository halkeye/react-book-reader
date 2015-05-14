/*global describe:false, it:false */
'use strict';
var expect = require('chai').expect;
var React = require('react/addons');
var BookWord = require('../../../src/js/components/BookWord.jsx');
var TestUtils = React.addons.TestUtils;

describe('BookWord', function() {
  it('changes the text after click', function() {
    var styles = {
      'unread': {
        fontPath: '',
        fontFamily: ''
      }
    };

    // Render a checkbox with label in the document
    var checkbox = TestUtils.renderIntoDocument(
      <BookWord audioTime={0.1} styles={styles} start={0} end={0.2} />
    );

    // Verify that it's Off by default
    var label = TestUtils.findRenderedDOMComponentWithTag( checkbox, 'label');
    expect(label.getDOMNode().textContent).to.equal('Off');

    // Simulate a click and verify that it is now On
    var input = TestUtils.findRenderedDOMComponentWithTag(
      checkbox, 'input');
    TestUtils.Simulate.change(input);
    expect(label.getDOMNode().textContent).to.equal('On');
  });
});
