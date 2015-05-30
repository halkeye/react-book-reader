/*global describe:false, it:false, beforeEach:false, afterEach:false */
/*jshint expr: false*/
'use strict';
const AUDIO_FILE = require('path').join(__dirname, '/1sec.mp3');

const sinon = require('sinon');
const expect = require('chai').expect;
const BookAudio = require('../../../src/js/models/BookAudio.jsx');
const Promise = require('es6-promise').Promise;

const EventEmitter = require('events').EventEmitter;

var MockAudio = function(file) {
  var obj = {};
  var emitter = new EventEmitter();

  obj.currentTime = function() { return 10; };
  obj.remove = function() { emitter.removeAllListeners(); };
  obj.preload = function() { return obj; };
  obj.autoplay = function() { return obj; };
  obj.on = function(sig, func) { emitter.on(sig, func); return obj; };
  obj.off = function(ev, func) {
    if (!func) {
      emitter.removeAllListeners(ev);
    } else {
      emitter.removeListener(ev, func);
    }
  };
  obj.emit = emitter.emit;
  obj.stop = obj.pause = function() {
    if (obj.endedTimeout) {
      clearTimeout(obj.endedTimeout);
    }
  };
  obj.pos = function() { return 0.10; };
  obj.play = function() {
    /* Pretend to play */
    setTimeout(function() { emitter.emit('play'); }, 1);
    /* Pretend to timeupdate */
    setTimeout(function() { emitter.emit('timeupdate'); }, 10);
    /* Pretend to ended */
    obj.endedTimeout = setTimeout(function() { emitter.emit('end'); }, 100);
  };
  return obj;
};

var MockAssetManager = function() {
  var obj = {};
  obj.getAsset = function(path) {
    var audioObj = {};
    audioObj.audio = new MockAudio(AUDIO_FILE);
    return new Promise((resolve, reject) => {
      resolve(audioObj);
    });
  };
  return obj;

};

describe('BookAudio', function() {
  beforeEach(function() {
    this.bookAudio = new BookAudio(new MockAssetManager());
  });
  afterEach(function() {
    this.bookAudio.removeAll();
  });
  it('object was created', function() {
    this.bookAudio.should.be.ok; //eslint-disable-line no-unused-expressions
  });
  // play, pause, ended, timeupdate
  //
  it('emit event on play', function(cb) {
    this.bookAudio.bind('word', 'play', function() {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
  });

  it('emit event on ended', function(cb) {
    this.bookAudio.bind('word', 'ended', function() {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
  });

  it('emit event on timeupdate', function(cb) {
    this.bookAudio.bind('word', 'timeupdate', function(time) {
      expect(time).not.to.be.null; //eslint-disable-line no-unused-expressions
      expect(time).not.to.be.undefined; //eslint-disable-line no-unused-expressions
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
  });

  it('emit when stopped', function(cb) {
    this.bookAudio.bind('word', 'ended', function() {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', AUDIO_FILE);
    this.bookAudio.stop();
  });
});
