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
        page,
        this.props.autoplay === true
      );
    });
  },
  pageLeft() {
    var newPage = this.props.page-1;
    this.switchPage(newPage);
  },
  pageRight() {
    var newPage = this.props.page+1;
    this.switchPage(newPage);
  },
  componentDidMount() {
    this.bindShortcut('left', this.pageLeft);
    this.bindShortcut('right', this.pageRight);
  }
});
module.exports = BookPage;
