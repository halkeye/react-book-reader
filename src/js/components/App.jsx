'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { ConnectedRouter } from 'react-router-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { history } from '../configureStore.js';
import { List } from 'immutable';
import {
  init,
  chooseBook,
  assetDownloadStarted,
  assetDownloadSuccess,
  assetDownloadError,
  assetDownloadReset
} from '../actions.js';
import ProgressBar from './ProgressBar.jsx';

// TODO - remove const assign = require('object-assign');

require('../../styles/main.scss');

/* Components */
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');
const Book = require('./Book.jsx');

/* Constants */
const AssetManager = require('../AssetManager.js');

export class App extends React.Component {
  static propTypes = {
    language: PropTypes.string,
    bookName: PropTypes.string,
    bookIconBig: PropTypes.string,
    bookLanguages: PropTypes.array,
    books: ImmutablePropTypes.list.isRequired,
    fonts: ImmutablePropTypes.map.isRequired,
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
    return (
      <BookList
        books={this.props.books}
        onChooseBook={book => this.props.dispatch(chooseBook(book))}
      />
    );
  }

  showPage () {
    const { book, bookName, language, page, autoplay } = this.props;
    // const page = typeof page === 'object' ? 'home' : page;
    // autoplay = typeof autoplay === 'object' ? false : autoplay;
    if (!bookName) {
      return;
    }

    if (book && book.id) {
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
      return <ProgressBar {...this.props.assets} />;
    }
  }

  startAssetTracking () {
    const { dispatch } = this.props;
    dispatch(assetDownloadReset());

    AssetManager.on('started', () => dispatch(assetDownloadStarted()));
    AssetManager.on('error', asset => dispatch(assetDownloadError(asset)));
    AssetManager.on('ended', asset => dispatch(assetDownloadSuccess(asset)));
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.fonts !== nextProps.fonts) {
      this.updateFonts();
    }
  }

  componentDidMount () {
    this.props.dispatch(init());
    this.startAssetTracking();

    window.addEventListener('resize', this.handleResize, true);
  }

  updateFonts () {
    let css = Object.keys(this.props.fonts)
      .map(
        font =>
          `@font-face {
font-family: '${font}';
src: url('${this.state.fonts[font]}.eot');
src: url('${this.state.fonts[font]}.eot#iefix') format('embedded-opentype'),
  url('${this.state.fonts[font]}.woff') format('woff'),
  url('${this.state.fonts[font]}.ttf') format('truetype'),
  url('${this.state.fonts[font]}.svg') format('svg');
        }`
      )
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
    fonts,
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
    fonts,
    language,
    page
  };
}

export default connect(mapStateToProps)(App);
