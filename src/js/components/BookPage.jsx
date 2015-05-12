'use strict';
const React = require('react');
const BookPageMixin = require('../mixins/BookPageMixin.jsx');
const MousetrapMixins = require('../mixins/MousetrapMixins.js');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');

let BookPage = React.createClass({
  mixins: [BookPageMixin, MousetrapMixins],
  switchPage(page) {
    BookStore.hasPage(this.props.book, this.props.language, page).then((result) => {
      if (!result) { return; }
      BookActionCreators.choosePage(
        this.props.book,
        this.props.language,
        page
      );
    });
  },
  componentDidMount() {
    this.bindShortcut('left', () => {
      var newPage = this.props.page-1;
      this.switchPage(newPage);
    });
    this.bindShortcut('right', () => {
      var newPage = this.props.page+1;
      this.switchPage(newPage);
    });
  }
});
module.exports = BookPage;
