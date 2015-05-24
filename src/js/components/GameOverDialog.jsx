'use strict';
const React = require('react');
const ImageButton = require('../components/ImageButton.jsx');

const GameOverDialog = React.createClass({
  render() {
    return (
      <div style={{ backgroundImage: 'url(' + 'books/Josephine/pages/gameEnd.png' + ')', position: 'absolute', top: '0', left: '90', height: '684', width: '883' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ backgroundImage: 'url(' + 'books/Josephine/game/gameEnd_title_en.png' + ')', position: 'absolute', top: '200', left: '215', height: '50', width: '469' }}></div>
          <ImageButton top="282" left="190" height="95" width="538" image={'books/Josephine/buttons/gameEnd_playAgain-en.png'} onClick={this.onBackButtonClick} />
          <ImageButton top="382" left="190" height="95" width="538" image={'books/Josephine/buttons/gameEnd_changeDiff-en.png'} onClick={this.onBackButtonClick} />
          <ImageButton top="482" left="190" height="95" width="538" image={'books/Josephine/buttons/gameEnd_backGameMenu-en.png'} onClick={this.onBackButtonClick} />
        </div>
      </div>
    );
  }
});
module.exports = GameOverDialog;

