'use strict';
const AppDispatcher = require('../dispatchers/AppDispatcher');
const Constants = require('../constants/AppConstants');
const BaseStore = require('./BaseStore');
const assign = require('object-assign');
const _ = require('lodash');

require('whatwg-fetch'); // polyfill
require('es6-promise').polyfill();

//const Promise = require('es6-promise').Promise;
/* Other */
const BookUtilities = require('../constants/BookUtilities.jsx');


// data storage

let _bookList = null;
let _bookData = {};
let _urls = null;
let _titles = {};

// Facebook style store creation.
let BookStore = assign({}, BaseStore, {
  getAnimFile(assetBaseUrl, animName) {
    return new Promise((resolve, reject) => {
      fetch(assetBaseUrl + '/animations/' + animName + '/anim.txt')
        .then((response) => {
          return response.text();
        })
        .then((text) => {
          var array = [];
          text.replace("\r", "\n").replace(/\n+/, "\n").split("\n").forEach((line) => {
            if (!line) { return; }
            let [frameNo, timing] = line.split(",");
            let imageObj = new Image();
            imageObj.src = assetBaseUrl + "/animations/" + animName + "/" + animName + frameNo + ".png";
            array.push({
              frame: imageObj,
              nextTiming: parseInt(timing, 10)
            });
          });

          resolve(array);
        });
    });
  },

  // public methods used by Controller-View to operate on data
  getAll() {
    return new Promise((resolve, reject) => {
      if (_bookList !== null) { return resolve(_bookList); }
      _urls = {};
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
    return new Promise((resolve, reject) => {
      if (_bookData && _bookData.id === book) { return resolve(_bookData); }
      BookStore.getAll().then((allBooks) => {
        let extraData = _.find(allBooks, function(data) { return data.id === book; });

        fetch(_urls[book])
          .then((response) => { return response.json(); })
          .then((json) => {
            let assetBaseUrl = BookUtilities.dirname(_urls[book]);
            _bookData = BookUtilities.processBookData(
              {},
              assetBaseUrl,
              json
            );
            _bookData.id = book;
            _bookData.assetBaseUrl = assetBaseUrl;
            _bookData.title = _bookData.title || extraData.title;
            _bookData.icon = _bookData.icon || extraData.icon;
            resolve(_bookData);
          })/*.catch(function(ex) {
            console.log('parsing failed', ex);
          })*/;
      });
    });
  },

  getLanguages(book) {
    return new Promise((resolve, reject) => {
      BookStore.getBook(book).then((bookData) => {
        return resolve(bookData.languages);
      });
    });
  },

  getPage(book, language, page) {
    return new Promise((resolve, reject) => {
      BookStore.getBook(book).then((bookData) => {
        bookData.pages[language][page].assetBaseUrl = _bookData.assetBaseUrl;
        return resolve(bookData.pages[language][page]);
      }).catch(reject);
    });
  },

  hasPage(book, language, page) {
    return new Promise((resolve, reject) => {
      BookStore.getBook(book).then((bookData) => {
        if (page in bookData.pages[language]) {
          return resolve(true);
        }
        return resolve(false);
      }).catch(reject);
    });
  }

/*
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
*/

});

module.exports = BookStore;

