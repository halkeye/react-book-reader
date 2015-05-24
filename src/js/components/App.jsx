const React = require('react');
const mui = require('material-ui');
const RouterMixin = require('react-mini-router').RouterMixin;
const navigate = require('react-mini-router').navigate;
const assign = require('object-assign');


/* Components */
let {RaisedButton, Dialog} = mui;
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');
const Book = require('./Book.jsx');
const DocumentTitle = require('react-document-title');
const Loader = require('react-loader');

/* Stores */
const BookStore = require('../stores/BookStore');

/* Dispatchers */
const AppDispatcher = require('../dispatchers/AppDispatcher.js');

/* Constants */
const Constants = require('../constants/AppConstants');

let fontTypes = [
  ['eot#iefix', 'embedded-opentype'],
  ['woff', 'woff'],
  ['ttf', 'truetype'],
  ['svg', 'svg']
];

let App = React.createClass({
  mixins: [RouterMixin],

  handleResize: function () {
    this.forceUpdate();
  },

  getInitialState() {
    return {
      fonts: {},
      book: {}
    };
  },

  routes: {
    '/': 'selectBook',
    '/book/:book': 'selectLanguage',
    '/book/:book/lang/:language': 'showPage',
    '/book/:book/lang/:language/page/:page': 'showPage',
    '/book/:book/lang/:language/page/:page/autoplay': 'showAutoPage'
  },

  notFound: function(path) {
    return <div class="not-found">Page Not Found: {path}</div>;
  },

  render: function() {
    return this.renderCurrentRoute();
  },

  selectLanguage(book) {
    return (
      <DocumentTitle title="Select a language">
        <div>
          <h1>Select a language</h1>
          <LanguageList book={book} />
        </div>
      </DocumentTitle>
    );
  },

  selectBook() {
    return (
      <DocumentTitle title="Select a book">
        <div>
          <h1>Select a book</h1>
          <BookList />
        </div>
      </DocumentTitle>
    );
  },

  showAutoPage(book, language, page) {
    return this.showPage(book, language, page, true);
  },

  showPage(book, language, page, autoplay) {
    page = typeof page === 'object' ? 'home' : page;
    autoplay = typeof autoplay === 'object' ? false : autoplay;

    if (this.state.book.id !== book) {
      BookStore.getBook(book).then((bookData) => {
        this.setState({ book: bookData });
      });
    }
    if (this.state.book.id) {
      return <Book book={this.state.book} language={language} page={page} autoplay={autoplay}></Book>;
    } else {
      return <Loader />;
    }
  },

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, true);
    AppDispatcher.register((payload) => {
      let action = payload.action;

      switch(action.type) {
        case Constants.ActionTypes.ADD_FONT:
          let fonts = this.state.fonts || {};
          if (!fonts[action.fontFamily]) {
            fonts[action.fontFamily] = action.fontPath;
            this.setState({fonts: fonts});
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
          if (parts.page === 0) { return null; }
          if (parts.page) {
            if (this.state.book.hasPage(parts.language, parts.page)) {
              return navigate('/book/' + parts.book + '/lang/' + parts.language + '/page/' + parts.page + (parts.autoplay ? '/autoplay' : ''));
            } else if (!isNaN(parts.page)) {
              return navigate('/book/' + parts.book + '/lang/' + parts.language + '/page/end' + (parts.autoplay ? '/autoplay' : ''));
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
  },

  updateFonts() {

    let css = Object.keys(this.state.fonts).map((font) => {
      return "@font-face {"+
        "  font-family: '" + font + "';" +
        "  src: url(" + this.state.fonts[font] + ".eot'); " +
        "  src: " + fontTypes.map((type) => {
            return "url('" + this.state.fonts[font] + '.' + type[0] + "') format('" + type[1] + "')";
          }).join(', ') + ";" +
        "}";
    }).join('');

    let styleId = 'ReactHtmlReaderFonts';
    let style = document.getElementById(styleId);
    if (style) { style.parentNode.removeChild(style); }

    style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
  }

});

module.exports = App;
