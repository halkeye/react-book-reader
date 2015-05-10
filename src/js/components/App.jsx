const React = require('react');
const mui = require('material-ui');
const RouterMixin = require('react-mini-router').RouterMixin;

require('whatwg-fetch'); // polyfill

/* Stores */
const BookStore = require('../stores/BookStore');
/* Actions */
const ActionCreator = require('../actions/TodoActionCreators');
const TaskList = require('./TaskList.jsx');
/* Components */
let {RaisedButton} = mui;
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');

/* Other */
const BookUtilities = require('../constants/BookUtilities');


let App = React.createClass({
  mixins: [RouterMixin],

  routes: {
    '/': 'selectBook',
    '/book/:book': 'selectLanguage',
    '/book/:book/lang/:language': 'showHome',
    '/book/:book/lang/:language/page/:page': 'showPage',
  },

  notFound: function(path) {
    return <div class="not-found">Page Not Found: {path}</div>;
  },

  render: function() {
    return this.renderCurrentRoute();
  },

  getInitialState() {
    return {
      books: [],
      book: {
        pages: {
          'en': [],
          'fr': []
        }
      }
    }
  },

  componentDidMount() {
    //TodoStore.addChangeListener(this._onChange);
    //this._onChange();
    BookStore.getAll().then((books) => {
      this.setState({ books: books });
    });
  },

  componentWillUnmount() {
    //TodoStore.removeChangeListener(this._onChange);
  },

  handleAddNewClick(e) {
    let title = prompt('Enter task title:');
    if (title) {
      ActionCreator.addItem(title);
    }
  },

  handleClearListClick(e) {
    ActionCreator.clearList();
  },

  selectLanguage(book) {
    return <div><LanguageList book={book} /></div>;
  },

  selectBook() {
    let {books} = this.state;
    return <BookList books={books} />;
  },

  showHome(book,language) {
    return <h1>HOME - {book} - {language}</h1>;
  },

});

module.exports = App;
