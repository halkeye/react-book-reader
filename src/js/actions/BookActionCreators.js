var AppDispatcher = require('../dispatchers/AppDispatcher');
var Constants = require('../constants/AppConstants');
var navigate = require('react-mini-router').navigate;

module.exports = {
  chooseBook: function(book) {
    navigate('/book/' + book);
  },

  chooseLanguage: function(book, language) {
    navigate('/book/' + book + '/lang/' + language);
  },

  choosePage: function(book, language, page) {
    navigate('/book/' + book + '/lang/' + language + '/page/' + page);
  }

};

