'use strict';
var AppDispatcher = require('../dispatchers/AppDispatcher');
var Constants = require('../constants/AppConstants');

module.exports = {
  chooseBook: function(book) {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.NAVIGATE_PAGE,
      data: { book: book, language: '', page: null }
    });
  },

  chooseLanguage: function(book, language) {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.NAVIGATE_PAGE,
      data: { language: language, page: null }
    });
  },

  changePage: function(payload) {
    AppDispatcher.handleViewAction({
      type: Constants.ActionTypes.NAVIGATE_PAGE,
      data: payload
    });
  }

};

