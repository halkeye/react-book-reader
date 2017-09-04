module.exports = {

  ActionTypes: {
    ADD_FONT: 'ADD_FONT',
    NAVIGATE_PAGE: 'NAVIGATE_PAGE'
  },

  ActionSources: {
    SERVER_ACTION: 'SERVER_ACTION',
    VIEW_ACTION: 'VIEW_ACTION'
  },

  Dimensions: {
    WIDTH: 1024,
    HEIGHT: 768,
    BUTTON_WIDTH: Math.round((112 / 1024) * 1024),
    BUTTON_HEIGHT: Math.round((112 / 768) * 768)
  }

};
