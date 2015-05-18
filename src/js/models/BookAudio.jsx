'use strict';
// require the core node events module
const EventEmitter = require('events').EventEmitter;
var _media = require('media').audio;

class BookAudio extends EventEmitter {
  constructor () {
    super();
    this.currentFilename = null;
    this.playMode = null;
    this.state = 'paused';
  }

  bind(type, ev, func) {
    this.on(type + '-' + ev, func);
    return this;
  }

  pause() {
    if (!this.audio) { return this; }
    this.audio.pause();
    return this;
  }

  stop() {
    if (!this.audio) { return this; }
    this.pause();
    this.audio.onEnded();
    return this;
  }

  play(type, path) {
    // don't double play
    if (this.playMode === type && this.currentFilename === path) {
      if (this.audio) { this.audio.play(); }
      return this;
    }

    this.playMode = type;
    this.currentFilename = path;

    let audio = _media(path).preload().autoplay();
    audio.on('play', () => {
      this.state = 'playing';
      this.emit(type + '-play');
    });
    audio.on('pause', () => { this.emit(type + '-pause'); });
    audio.onEnded = () => {
      this.emit(type + '-ended');
      audio.remove();
      if (this.audio === audio) {
        this.currentFilename = null;
        this.playMode = null;
        this.audio = null;
      }
    };
    audio.on('ended', audio.onEnded );
    audio.on('timeupdate', () => {
      // ignore leftovers if we've moved onto a new soundclip
      if (audio === this.audio) {
        this.emit(type + '-timeupdate', audio.currentTime() );
      }
    });

    this.audio = audio;
    return this;
  }

  removeAll() {
    this.removeAllListeners();
    if (this.audio) {
      this.audio.remove();
      this.audio = null;
    }
  }
}

module.exports = BookAudio;
BookAudio.setMock = function(AudioClass) { _media = AudioClass; };


/*
 * let audio = new BookAudio();
 * audio.bind('word', 'ended', this.onWordEnded);
 * audio.bind('page', 'ended', this.onWordEnded);
 *
 * audio.play('word', '..path..to..mp3');
 * audio.play('page', '..path..to..mp3');
 *
 * audio.destroy();
 */
