'use strict';
const React = require('react');
const ImageButton = require('../components/ImageButton.jsx');

const GameOverDialog = React.createClass({
  render() {
    let asset_manager = this.props.asset_manager;
    return (
      <div style={{ backgroundImage: 'url(' + asset_manager.getAsset('pages/gameEnd.png').src + ')', position: 'absolute', top: '0', left: '90', height: '684', width: '883' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ backgroundImage: 'url(' + asset_manager.getAsset('game/gameEnd_title_en.png').src + ')', position: 'absolute', top: '200', left: '215', height: '50', width: '469' }}></div>
          <ImageButton top="282" left="190" height="95" width="538" asset_manager={asset_manager} image={'buttons/gameEnd_playAgain-en.png'} onClick={this.props.onPlayAgain} />
          <ImageButton top="382" left="190" height="95" width="538" asset_manager={asset_manager} image={'buttons/gameEnd_changeDiff-en.png'} onClick={this.props.onChangeDiff} />
          <ImageButton top="482" left="190" height="95" width="538" asset_manager={asset_manager} image={'buttons/gameEnd_backGameMenu-en.png'} onClick={this.props.onBackGameMenu} />
        </div>
      </div>
    );
  }
});
module.exports = GameOverDialog;

