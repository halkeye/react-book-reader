const React = require('react');
const mui = require('material-ui');
const RouterMixin = require('react-mini-router').RouterMixin;

/* Components */
let {RaisedButton,Dialog} = mui;
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');
const Page = require('./Page.jsx');
const BookPage = require('./BookPage.jsx');

let App = React.createClass({
  mixins: [RouterMixin],

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
  }

});

module.exports = App;
