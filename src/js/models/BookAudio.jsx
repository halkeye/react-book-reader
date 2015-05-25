'use strict';
// require the core node events module
const EventEmitter = require('events').EventEmitter;

class BookAudio extends EventEmitter {
  constructor (asset_manager) {
    super();
    this.asset_manager = asset_manager;
    this.currentFilename = null;
    this.playMode = null;
    this.state = 'paused';
  }

  bind(type, ev, func) {
    this.on(type + '-' + ev, func);
    return this;
  }

  pause() {
    this.stopUpdateCurrentDuration();
    if (!this.asset) { return this; }
    this.asset.pause();
    return this;
  }

  stop() {
    this.stopUpdateCurrentDuration();
    if (!this.asset) { return this; }
    this.asset.stop();
    this.asset.onEnded();
    return this;
  }

  play(type, path) {
    let asset = this.asset_manager.getAsset(path).audio;
    // don't double play
    if (this.playMode === type && asset === this.asset && this.asset !== null) {
      if (this.asset) {
        this.interval = setInterval(this.updateCurrentDuration.bind(this, this.asset, type), 100);
        this.asset.play();
      }
      return this;
    }

    this.playMode = type;
    asset.on('play', () => {
      this.state = 'playing';
      this.emit(type + '-play');
    });
    asset.on('pause', () => { this.emit(type + '-pause'); });
    asset.onEnded = () => {
      asset.off('play');
      asset.off('pause');
      asset.off('end');
      this.emit(type + '-ended');
      if (this.asset === asset) {
        this.playMode = null;
        this.asset = null;
        this.stopUpdateCurrentDuration();
      }
    };
    asset.on('end', asset.onEnded );
    this.interval = setInterval(this.updateCurrentDuration.bind(this, asset, type), 100);
    asset.play();

    this.asset = asset;
    return this;
  }

  removeAll() {
    this.removeAllListeners();
    this.stop();
    this.stopUpdateCurrentDuration();
    if (this.asset) { this.stop(); }
  }

  updateCurrentDuration(asset, type) {
    this.emit(type + '-timeupdate', asset.pos() );
  }

  stopUpdateCurrentDuration() {
    clearInterval(this.interval);
    delete this.interval;
  }

}

module.exports = BookAudio;
