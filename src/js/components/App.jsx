const React = require('react');
const mui = require('material-ui');
const RouterMixin = require('react-mini-router').RouterMixin;

/* Components */
let {RaisedButton,Dialog} = mui;
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');
const Page = require('./Page.jsx');
const BookPage = require('./BookPage.jsx');

/* Dispatchers */
const AppDispatcher = require('../dispatchers/AppDispatcher.js');

/* Constants */
const Constants = require('../constants/AppConstants');

let fontTypes = [
  ['eot#iefix', 'embedded-opentype'],
  ['woff', 'woff'],
  ['ttf', 'truetype'],
  ['svg', 'svg'],
];

let App = React.createClass({
  mixins: [RouterMixin],

  getInitialState() {
    return {
      fonts: {}
    };
  },

  routes: {
    '/': 'selectBook',
    '/book/:book': 'selectLanguage',
    '/book/:book/lang/:language': 'showHome',
    '/book/:book/lang/:language/page/:page': 'showPage',
    '/book/:book/lang/:language/page/:page/autoPlay': 'showAutoplayPage',
  },

  notFound: function(path) {
    return <div class="not-found">Page Not Found: {path}</div>;
  },

  render: function() {
    return this.renderCurrentRoute();
  },

  selectLanguage(book) {
    return (
      <Dialog
        title="Select a language"
        openImmediately={true}
      >
        <LanguageList book={book} />
      </Dialog>
    );
  },

  selectBook() {
    return (
      <Dialog
        title="Select a book"
        openImmediately={true}
      >
        <BookList />
      </Dialog>
    );
  },

  showHome(book,language) {
    return (
      <div><Page key="page_home" book={book} language={language} page="home" /></div>
    );
  },

  showAutoplayPage(book,language,page) {
    return this.showPage(book,language,page,true);
  },

  showPage(book, language, page, autoplay) {
    if (isNaN(page))
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
    }
  },

  componentDidMount() {
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

        // add more cases for other actionTypes...
      }
    })
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
