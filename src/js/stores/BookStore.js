const AppDispatcher = require('../dispatchers/AppDispatcher');
const Constants = require('../constants/AppConstants');
const BaseStore = require('./BaseStore');
const assign = require('object-assign');

require('whatwg-fetch'); // polyfill
require('es6-promise').polyfill();

const Promise = require('es6-promise').Promise;
/* Other */
const BookUtilities = require('../constants/BookUtilities');


// data storage

let _bookList = null;
let _currentBook = null;
let _bookData = {};
let _urls = {};
let _icons = {};
let _titles = {};

// Facebook style store creation.
let BookStore = assign({}, BaseStore, {

  // public methods used by Controller-View to operate on data
  getAll() {
    return new Promise((resolve,reject) => {
      if (_bookList != null) { return resolve(_bookList); }
      fetch('books/index.json')
        .then((response) => {
          _bookList = response.json();
          return _bookList;
        })
        .then((json) => {
          json.forEach((book, i) => {
            _urls[book.id] = 'books/' + book.url;
            book.icon = 'books/' + book.icon;
          });
          resolve(json);
        }).catch(function(ex) {
          console.log('parsing failed', ex);
        });
    });
  },

  /* FIXME - return book object */
  getBook(book) {
    return new Promise((resolve,reject) => {
      if (_currentBook == book) { return resolve(_bookData); }
      BookStore.getAll().then((books) => {
        fetch(_urls[book])
          .then((response) => { return response.json() })
          .then((json) => {
            _currentBook = book;
            _bookData = BookUtilities.processBookData(
              {},
              BookUtilities.dirname(_urls[book]),
              json
            );
            resolve(_bookData);
          }).catch(function(ex) {
            console.log('parsing failed', ex);
          });
      });
    });
  },

  getLanguages(book) {
    return new Promise((resolve,reject) => {
      BookStore.getBook(book).then((bookData) => {
        return resolve(bookData.languages);
      });
    });
  },

  getPage(book, language, page) {
    return new Promise((resolve,reject) => {
      BookStore.getBook(book).then((bookData) => {
        return resolve(bookData.pages[language][page]);
      }).catch(reject);
    });
  },

  hasPage(book, language, page) {
    return new Promise((resolve,reject) => {
      BookStore.getBook(book).then((bookData) => {
        if (page in bookData.pages[language]) {
          return resolve(true);
        }
        return resolve(false);
      }).catch(reject);
    });
  },

  // register store with dispatcher, allowing actions to flow through
  dispatcherIndex: AppDispatcher.register(function(payload) {
    let action = payload.action;

    switch(action.type) {
      case Constants.ActionTypes.ADD_TASK:
        let text = action.text.trim();
        // NOTE: if this action needs to wait on another store:
        // AppDispatcher.waitFor([OtherStore.dispatchToken]);
        // For details, see: http://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html#why-we-need-a-dispatcher
        if (text !== '') {
          addItem(text);
          BookStore.emitChange();
        }
        break;

      // add more cases for other actionTypes...
    }
  })

});

module.exports = BookStore;

