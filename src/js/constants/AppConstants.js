const keyMirror = require('react/lib/keyMirror');

module.exports = {

  ActionTypes: keyMirror({
    ADD_FONT: null,
    NAVIGATE_PAGE: null
  }),

  ActionSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  }),

  Dimensions: {
    WIDTH: 1024,
    HEIGHT: 768,
    BUTTON_WIDTH: Math.round((112 / 1024) * 1024),
    BUTTON_HEIGHT: Math.round((112 / 768) * 768)
  }

};
