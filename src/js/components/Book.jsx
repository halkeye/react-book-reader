'use strict';
const React = require('react');
const Constants = require('../constants/AppConstants');

const DocumentMeta = require('react-document-meta');
const DocumentTitle = require('react-document-title');

const Screen = require('./Screen.jsx');

let Book = React.createClass({
  propTypes: {
    book: React.PropTypes.object.isRequired,
    language: React.PropTypes.string.isRequired,
    page: React.PropTypes.string.isRequired
  },

  getPageTitle() {
    let str = this.props.book.title || 'Untitled';
    // if numeric page number
    // str += ' - ' + pageNumber
    // FIXME
    return str;
  },

  render() {
    let docMeta = {
      title: this.getPageTitle(),
      // description
      meta: {
        'charset': 'utf-8',
        name: {
          'apple-mobile-web-app-capable': 'yes',
          'mobile-web-app-capable': 'yes'
        }
      },
      link: {
        rel: {
          'shortcut icon': [this.props.book.icon]
        }
      }
      //<link rel="shortcut icon" sizes="196x196" href="icon-196x196.png">
    };
    //if (this.props.book.icon) { docMeta.push({ name: 'shortcut icon', sizes: '29x29', 'path': this.props.book.icon }); }

    // <Screen book={book} language={language} page={page} />
    /*if (isNaN(page))
    {
      return (
        <div><Page key={'page_' + page} book={book} language={language} page={page} /></div>
      );
    }
    else
    {
      page = parseInt(page,10);
      return (
        <div><BookPage key={'page_' + page} book={book} language={language} page={page} autoplay={autoplay} /></div>
      );
    }*/
    let page = {};
    if (this.props.book.pages) {
      page = this.props.book.pages[this.props.language][this.props.page];
    }
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div>
          <DocumentMeta {...docMeta} />
          <Screen key={"screen_" + page} page={page} autoplay={this.props.autoplay} />
        </div>
      </DocumentTitle>
    );
  }
});

module.exports = Book;
