'use strict';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
const React = require('react');
const assign = require('object-assign');

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

const navigate = (...args) => {
  debugger; // eslint-disable-line
  alert([...args].join('---'));
};

class App extends React.Component {
  handleResize () {
    this.forceUpdate();
  }

  constructor () {
    super();
    this.state = {
      assetsStarted: 0,
      assetsEnded: 0,
      fonts: {},
      book: {},
      path: '/'
    };
  }

  notFound (path) {
    return <div className="not-found">Page Not Found: {path}</div>;
  }

  render () {
    return (
      <MuiThemeProvider>
        <Router>
          <Switch>
            <Route exact path="/" render={this.selectBook} />
            <Route path="/book/:book" render={this.selectLanguage} />
            <Route path="/book/:book/lang/:language" render={this.showPage} />
            <Route
              path="/book/:book/lang/:language/page"
              render={this.showPage}
            />
            <Route
              path="/book/:book/lang/:language/page/:page"
              render={this.showPage}
            />
            <Route
              path="/book/:book/lang/:language/page/:page/autoplay"
              render={this.showAutoPage}
            />
          </Switch>
        </Router>
      </MuiThemeProvider>
    );
  }

  selectLanguage ({ match }) {
    return <LanguageList book={match.params.book} />;
  }

  selectBook () {
    return (
      <DocumentTitle title="Select a book">
        <div>
          <h1>Select a book</h1>
          <BookList />
        </div>
      </DocumentTitle>
    );
  }

  showAutoPage (book, language, page) {
    return this.showPage(book, language, page, true);
  }

  loadBook (bookName, language) {
    let key = ['book', bookName, 'lang', language].join('_');
    if (key !== this.loadingBook) {
      this.loadingBook = key;
      this.startAssetTracking();
      BookStore.getBook(bookName, language)
        .then(bookData => {
          this.stopAssetTracking();
          this.setState({ book: bookData });
        })
        .catch(function (ex) {
          console.log('error', ex);
        });
    }
  }

  showPage (bookName, language, page, autoplay) {
    page = typeof page === 'object' ? 'home' : page;
    autoplay = typeof autoplay === 'object' ? false : autoplay;
    this.loadBook(bookName, language);

    if (this.state.book.id) {
      return (
        <Book
          book={this.state.book}
          language={language}
          page={page}
          autoplay={autoplay}
        />
      );
    } else {
      let percent = 0;
      if (this.state.assetsStarted && this.state.assetsEnded) {
        percent = this.state.assetsEnded / this.state.assetsStarted * 100;
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

  onAssetStarted (asset) {
    this.started++;
  }

  onAssetEnded (asset) {
    this.ended++;
  }

  onAssetError (asset, path) {
    // FIXME - need to handle something here
    console.log('error', asset);
  }

  startAssetTracking () {
    this.started = this.ended = 0;

    AssetManager.on('started', this.onAssetStarted);
    AssetManager.on('error', this.onAssetError);
    AssetManager.on('ended', this.onAssetEnded);
    this.assetInterval = setInterval(() => {
      if (
        this.state.assetsStarted === this.started &&
        this.state.assetsEnded === this.ended
      ) {
        return;
      }
      this.setState({ assetsStarted: this.started, assetsEnded: this.ended });
    }, 100);
  }

  stopAssetTracking () {
    if (this.assetInterval) {
      clearInterval(this.assetInterval);
      delete this.assetInterval;
    }
    AssetManager.off('started', this.onAssetStarted);
    AssetManager.off('error', this.onAssetError);
    AssetManager.off('ended', this.onAssetEnded);
  }

  componentWillUnmount () {
    this.stopAssetTracking();
  }

  componentDidMount () {
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
          let parts = this.state.path.split('/');
          parts = assign(
            {
              book: parts[2],
              language: parts[4],
              page: parts[6],
              autoplay: parts[7]
            },
            action.data
          );
          if (parts.page === 0) {
            return null;
          }
          if (parts.page) {
            if (this.state.book.hasPage(parts.page)) {
              return navigate(
                '/book/' +
                  parts.book +
                  '/lang/' +
                  parts.language +
                  '/page/' +
                  parts.page +
                  (parts.autoplay ? '/autoplay' : '')
              );
            } else if (!isNaN(parts.page)) {
              return navigate(
                '/book/' +
                  parts.book +
                  '/lang/' +
                  parts.language +
                  '/page/end' +
                  (parts.autoplay ? '/autoplay' : '')
              );
            }
          } else if (parts.language) {
            return navigate('/book/' + parts.book + '/lang/' + parts.language);
          } else if (parts.book) {
            return navigate('/book/' + parts.book);
          } else {
            return navigate('/');
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

module.exports = App;
