const React = require('react');
const BookPageMixin = require('../mixins/BookPageMixin.jsx');

let Page = React.createClass({
  mixins: [BookPageMixin],
});
module.exports = Page;

