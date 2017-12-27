'use strict';
const PropTypes = require('prop-types');
const React = require('react');

const DocumentMeta = require('react-document-meta');
const DocumentTitle = require('react-document-title');

const Screen = require('./Screen.jsx');
const GamePP = require('./GamePP.jsx');
const GameFullMonty = require('./GameFullMonty.jsx');

class Book extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    book: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
    page: PropTypes.string.isRequired,
    autoplay: PropTypes.bool.isRequired
  };

  getInitialProps = () => {
    return {
      book: {
        pages: {}
      }
    };
  };

  getPageTitle = () => {
    let str = this.props.book.title || 'Untitled';
    // if numeric page number
    // str += ' - ' + pageNumber
    // FIXME
    return str;
  };

  render () {
    let docMeta = {
      title: this.getPageTitle(),
      // description
      meta: {
        charset: 'utf-8',
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
      // <link rel="shortcut icon" sizes="196x196" href="icon-196x196.png">
    };
    // if (this.props.book.icon) { docMeta.push({ name: 'shortcut icon', sizes: '29x29', 'path': this.props.book.icon }); }

    // <Screen book={book} language={language} page={page} />
    /* if (isNaN(page))
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
    } */
    let body = '';
    if (this.props.book.hasGame(this.props.page)) {
      let page = this.props.book.games[this.props.page];
      if (!page.gameName) {
        body = <h1>NO IDEA WHAT TO DO {this.props.page}</h1>;
      } else if (page.gameName === 'PP' || page.gameName === 'WP') {
        body = (
          <GamePP
            dispatch={this.props.dispatch}
            key={'screen_' + this.props.page}
            page={page}
            mode={page.gameName}
          />
        );
      } else if (page.gameName === 'fullMonty') {
        body = <GameFullMonty key={'screen_' + this.props.page} page={page} dispatch={this.props.dispatch} />;
      }
    } else {
      let page = this.props.book.pages[this.props.page];
      body = (
        <Screen
          dispatch={this.props.dispatch}
          key={'screen_' + this.props.page}
          page={page}
          autoplay={this.props.autoplay}
        />
      );
    }
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div>
          <DocumentMeta {...docMeta} />
          {body}
        </div>
      </DocumentTitle>
    );
  }
}

module.exports = Book;
