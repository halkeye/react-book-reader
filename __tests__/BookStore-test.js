// __tests__/BookStore-test.js

jest.dontMock('../src/js/stores/BookStore.js');
describe('BookStore', function() {
  it('blah', function(cb) {
    var React = require('react/addons');
    var BookStore = require('../BookStore.js');
    var TestUtils = React.addons.TestUtils;

    expect("a".toBe("b"));
    cb();
  })
});
