'use strict';
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

// Facebook style store creation.
let BookStore = assign({}, BaseStore, {
  // public methods used by Controller-View to operate on data
  getAll () {
    return new Promise((resolve, reject) => {
      if (_bookList !== null) {
        return resolve(_bookList);
      }
      _urls = {};
      const baseUrl = 'https://books.saltystories.ca/';
      fetch(baseUrl + 'books/index.json?_cacheBust=' + new Date().getTime())
        .then(response => response.json())
        .then(json => {
          _bookList = json.map(book => {
            book = assign({}, book);
            _urls[book.id] = baseUrl + 'books/' + book.url;
            book.iconBig = baseUrl + 'books/' + (book.iconBig || book.icon);
            book.icon = baseUrl + 'books/' + book.icon;
            return book;
          });
          resolve(_bookList);
        })
        .catch(function (ex) {
          console.log('parsing failed', ex);
          reject(ex);
        });
    });
  },

  /* FIXME - return book object */
  getBook (book, language) {
    if (!book) {
      throw new Error('No such book');
    }
    return new Promise((resolve, reject) => {
      if (_bookData && _bookData.id === book) {
        return resolve(_bookData);
      }
      BookStore.getAll().then(allBooks => {
        let extraData = _.find(allBooks, function (data) {
          return data.id === book;
        });

        return fetch(_urls[book])
          .then(response => {
            console.log('a', book, _urls[book]);
            return response.json();
          })
          .then(json => {
            let assetBaseUrl = BookUtilities.dirname(_urls[book]);
            return BookUtilities.processBookData(
              {},
              assetBaseUrl,
              json,
              language
            ).then(
              function (values) {
                _bookData = values[0];
                _bookData.id = book;
                _bookData.title = _bookData.title || extraData.title;
                _bookData.icon = _bookData.icon || extraData.icon;
                resolve(_bookData);
              },
              function (values) {
                console.log('rejected processBookData', values);
                reject(values);
              }
            );
          }) /* .catch(function(ex) {
            console.log('parsing failed', ex);
          }) */;
      });
    });
  }
});

module.exports = BookStore;
