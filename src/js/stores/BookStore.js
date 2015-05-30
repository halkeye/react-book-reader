'use strict';
const AppDispatcher = require('../dispatchers/AppDispatcher');
const Constants = require('../constants/AppConstants');
const BaseStore = require('./BaseStore');
const assign = require('object-assign');
const _ = require('lodash');

require('whatwg-fetch'); // polyfill
/* Other */
const BookUtilities = require('../constants/BookUtilities.jsx');


// data storage

let _bookList = null;
let _bookData = {};
let _urls = null;
let _titles = {};

// Facebook style store creation.
let BookStore = assign({}, BaseStore, {
  // public methods used by Controller-View to operate on data
  getAll() {
    return new Promise((resolve, reject) => {
      if (_bookList !== null) { return resolve(_bookList); }
      _urls = {};
      fetch('books/index.json')
        .then(response => response.json())
        .then((json) => {
          _bookList = json.map((book, i) => {
            book = assign({}, book);
            _urls[book.id] = 'books/' + book.url;
            book.iconBig = 'books/' + (book.iconBig || book.icon);
            book.icon = 'books/' + book.icon;
            return book;
          });
          resolve( _bookList);
        }).catch(function(ex) {
          console.log('parsing failed', ex);
        });
    });
  },

  /* FIXME - return book object */
  getBook(book, language) {
    return new Promise((resolve, reject) => {
      if (_bookData && _bookData.id === book) { return resolve(_bookData); }
      BookStore.getAll().then((allBooks) => {
        let extraData = _.find(allBooks, function(data) { return data.id === book; });

        fetch(_urls[book])
          .then((response) => { return response.json(); })
          .then((json) => {
            let assetBaseUrl = BookUtilities.dirname(_urls[book]);
            BookUtilities.processBookData(
              {},
              assetBaseUrl,
              json,
              language
            ).then(function(values) {
              _bookData = values[0];
              _bookData.id = book;
              _bookData.title = _bookData.title || extraData.title;
              _bookData.icon = _bookData.icon || extraData.icon;
              resolve(_bookData);
            }, function(values) {
              console.log('rejected processBookData', values);
              reject(values);
            });
          })/*.catch(function(ex) {
            console.log('parsing failed', ex);
          })*/;
      });
    });
  },

  getLanguages(bookName) {
    return new Promise((resolve, reject) => {
      BookStore.getAll().then((books) => {
         let book = books.filter((bookElm) => { return bookElm.id === bookName; })[0];
         resolve(book.languages);
      });
    });
  }
});

module.exports = BookStore;

