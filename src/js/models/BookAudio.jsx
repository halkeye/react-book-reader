'use strict';
// require the core node events module
const EventEmitter = require('events').EventEmitter;
var _play = require('play-audio');

class BookAudio extends EventEmitter {
  constructor () {
    super();
  }

  bind(type, ev, func) {
    this.on(type + '-' + ev, func);
  }

  play(type, path) {
    this.playMode = type;

    this.audio = _play(path).preload().autoplay();
    this.audio.on('play', () => {
      this.emit(type + '-play');
    });
    this.audio.on('pause', () => { this.emit(type + '-pause'); });
    this.audio.on('ended', () => {
      this.emit(type + '-ended');
      this.audio.remove();
      this.audio = null;
    });
    this.audio.on('timeupdate', () => {
      this.emit(type + '-timeupdate', this.audio.currentTime() );
    });
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
BookAudio.setMock = function(AudioClass) { _play = AudioClass; };


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
