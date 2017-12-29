'use strict';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { ConnectedRouter } from 'react-router-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { history } from '../configureStore.js';
import { List } from 'immutable';
import {
  init,
  push,
  assetDownloadStarted,
  assetDownloadSuccess,
  assetDownloadError,
  assetDownloadReset
} from '../actions.js';

const React = require('react');
// TODO - remove const assign = require('object-assign');

require('../../styles/main.scss');

/* Components */
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');
const Book = require('./Book.jsx');
const DocumentTitle = require('react-document-title');

/* Stores */
const BookStore = require('../stores/BookStore');

/* Dispatchers */
const AppDispatcher = require('../dispatchers/AppDispatcher.js');

/* Constants */
const Constants = require('../constants/AppConstants');
const AssetManager = require('../AssetManager.js');

let fontTypes = [
  ['eot#iefix', 'embedded-opentype'],
  ['woff', 'woff'],
  ['ttf', 'truetype'],
  ['svg', 'svg']
];

export class App extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    language: PropTypes.string,
    bookName: PropTypes.string,
    bookIconBig: PropTypes.string,
    bookLanguages: PropTypes.array,
    books: ImmutablePropTypes.list.isRequired,
    book: PropTypes.object,
    page: PropTypes.string,
    autoplay: PropTypes.string,
    assets: PropTypes.shape({
      total: PropTypes.number,
      loaded: PropTypes.number
    }).isRequired,
    dispatch: PropTypes.func.isRequired
  };

  static defaultProps = {
    books: new List([]),
    assets: { loaded: null, total: null }
  };

  handleResize () {
    this.forceUpdate();
  }

  constructor () {
    super();
    this.state = {
      fonts: {}
    };
  }

  render () {
    const ret = (() => {
      if (this.props.book && this.props.language && this.props.page) {
        return this.showPage();
      }
      if (this.props.language) {
        return this.showPage();
      }
      if (this.props.bookName) {
        return this.selectLanguage();
      }
      return this.selectBook();
    })();
    return (
      <MuiThemeProvider>
        <ConnectedRouter history={history}>{ret}</ConnectedRouter>
      </MuiThemeProvider>
    );
  }

  selectLanguage () {
    if (!this.props.bookLanguages) {
      return <div>Loading Language Choices...</div>;
    }
    return (
      <LanguageList
        iconBig={this.props.bookIconBig}
        languages={this.props.bookLanguages}
        dispatch={this.props.dispatch}
      />
    );
  }

  selectBook () {
    if (!this.props.books) {
      return <div>Loading Books...</div>;
    }
    return (
      <DocumentTitle title="Select a book">
        <div>
          <h1>Select a book</h1>
          <BookList books={this.props.books} dispatch={this.props.dispatch} />
        </div>
      </DocumentTitle>
    );
  }

  loadBook (bookName, language) {
    let key = ['book', bookName, 'lang', language].join('_');
    if (key !== this.loadingBook) {
      this.loadingBook = key;
      this.startAssetTracking();
      BookStore.getBook(bookName, language)
        .then(bookData => {
          this.setState({ book: bookData });
        })
        .catch(function (ex) {
          console.log('error', ex);
        });
    }
  }

  showPage () {
    const { book, bookName, language, page, autoplay } = this.props;
    // const page = typeof page === 'object' ? 'home' : page;
    // autoplay = typeof autoplay === 'object' ? false : autoplay;
    if (!bookName) {
      return;
    }
    this.loadBook(bookName, language);

    if (book.id) {
      return (
        <Book
          dispatch={this.props.dispatch}
          book={book}
          language={language}
          page={page || 'home'}
          autoplay={autoplay || false}
        />
      );
    } else {
      let percent = 0;
      if (this.props.assets.total && this.props.assets.loaded) {
        percent = this.props.assets.loaded / this.props.assets.total * 100;
      }

      let style = {
        width: Math.max(0, Math.min(percent, 100)) + '%',
        transition: 'width 200ms'
      };

      return (
        <div className="progressbar-container">
          <div className="progressbar-progress" style={style}>
            {this.props.children}
          </div>
        </div>
      );
    }
  }

  startAssetTracking () {
    const { dispatch } = this.props;
    dispatch(assetDownloadReset());

    AssetManager.on('started', () => dispatch(assetDownloadStarted()));
    AssetManager.on('error', asset => dispatch(assetDownloadError(asset)));
    AssetManager.on('ended', asset => dispatch(assetDownloadSuccess(asset)));
  }

  componentDidMount () {
    this.props.dispatch(init());

    window.addEventListener('resize', this.handleResize, true);
    AppDispatcher.register(payload => {
      let action = payload.action;

      switch (action.type) {
        case Constants.ActionTypes.ADD_FONT:
          let fonts = this.state.fonts || {};
          if (!fonts[action.fontFamily]) {
            fonts[action.fontFamily] = action.fontPath;
            this.setState({ fonts: fonts });
            this.updateFonts();
          }
          break;
        case Constants.ActionTypes.NAVIGATE_PAGE:
          const parts = this.props;
          console.log('parts', parts);
          if (parts.page === 0) {
            return null;
          }
          if (parts.page) {
            if (this.props.book.hasPage(parts.page)) {
              return this.props.dispatch(
                push(
                  '/book/' +
                    parts.book +
                    '/lang/' +
                    parts.language +
                    '/page/' +
                    parts.page +
                    (parts.autoplay ? '/autoplay' : '')
                )
              );
            } else if (!isNaN(parts.page)) {
              return this.props.dispatch(
                push(
                  '/book/' +
                    parts.book +
                    '/lang/' +
                    parts.language +
                    '/page/end' +
                    (parts.autoplay ? '/autoplay' : '')
                )
              );
            }
          } else if (parts.language) {
            return this.props.dispatch(
              push('/book/' + parts.book + '/lang/' + parts.language)
            );
          } else if (parts.book) {
            return this.props.dispatch(push('/book/' + parts.book));
          } else {
            return this.props.dispatch(push('/'));
          }
          console.log('payload', action.data, this.state.path.split('/'));
          break;
        // add more cases for other actionTypes...
      }
      return null;
    });
  }

  updateFonts () {
    let css = Object.keys(this.state.fonts)
      .map(font => {
        return (
          '@font-face {' +
          "  font-family: '" +
          font +
          "';" +
          '  src: url(' +
          this.state.fonts[font] +
          ".eot'); " +
          '  src: ' +
          fontTypes
            .map(type => {
              return (
                "url('" +
                this.state.fonts[font] +
                '.' +
                type[0] +
                "') format('" +
                type[1] +
                "')"
              );
            })
            .join(', ') +
          ';' +
          '}'
        );
      })
      .join('');

    let styleId = 'ReactHtmlReaderFonts';
    let style = document.getElementById(styleId);
    if (style) {
      style.parentNode.removeChild(style);
    }

    style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
  }
}

function mapStateToProps (state) {
  const {
    assets,
    autoplay,
    bookIconsBig,
    bookLanguages,
    bookName,
    books,
    language,
    page
  } = state;

  return {
    assets,
    autoplay,
    bookIconBig: bookIconsBig[bookName],
    bookLanguages: bookLanguages[bookName],
    bookName, // FIXME remove when fully removed old stores
    books,
    language,
    page
  };
}

export default connect(mapStateToProps)(App);
