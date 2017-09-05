'use strict';
const AUDIO_FILE = require('path').join(__dirname, '/1sec.mp3');

const BookAudio = require('../../../src/js/models/BookAudio.jsx');
const Promise = require('es6-promise').Promise;

const EventEmitter = require('events').EventEmitter;

function MockAudio (file) {
  const obj = {};
  const emitter = new EventEmitter();

  obj.currentTime = () => {
    return 10;
  };
  obj.remove = () => {
    emitter.removeAllListeners();
  };
  obj.preload = () => {
    return obj;
  };
  obj.autoplay = () => {
    return obj;
  };
  obj.on = (sig, func) => {
    emitter.on(sig, func);
    return obj;
  };
  obj.off = (ev, func) => {
    if (!func) {
      emitter.removeAllListeners(ev);
    } else {
      emitter.removeListener(ev, func);
    }
  };
  obj.emit = emitter.emit;
  obj.stop = obj.pause = () => {
    if (obj.endedTimeout) {
      clearTimeout(obj.endedTimeout);
    }
  };
  obj.pos = () => {
    return 0.1;
  };
  obj.play = () => {
    /* Pretend to play */
    setTimeout(() => {
      emitter.emit('play');
    }, 1);
    /* Pretend to timeupdate */
    setTimeout(() => {
      emitter.emit('timeupdate');
    }, 10);
    /* Pretend to ended */
    obj.endedTimeout = setTimeout(() => {
      emitter.emit('end');
    }, 100);
  };
  return obj;
};

function MockAssetManager () {
  const obj = {};
  obj.getAsset = (path) => {
    const audioObj = {};
    audioObj.audio = new MockAudio(AUDIO_FILE);
    return Promise.resolve(audioObj);
  };
  return obj;
};

describe('BookAudio', function () {
  beforeEach(() => {
    this.bookAudio = new BookAudio(new MockAssetManager());
  });
  afterEach(() => {
    this.bookAudio.removeAll();
  });
  it('object was created', () => {
    expect(this.bookAudio).toBeTruthy();
  });
  // play, pause, ended, timeupdate
  //
  it('emit event on play', (cb) => {
    this.bookAudio.bind('word', 'play', () => {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
  });

  it('emit event on ended', (cb) => {
    this.bookAudio.bind('word', 'ended', () => {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
  });

  it('emit event on timeupdate', (cb) => {
    this.bookAudio.bind('word', 'timeupdate', (time) => {
      expect(time).not.toBeUndefined();
      expect(time).not.toBeNull();
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
  });

  it('emit when stopped', (cb) => {
    this.bookAudio.bind('word', 'ended', () => {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
    this.bookAudio.stop();
  });
});
