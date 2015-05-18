/*global describe:false, it:false, beforeEach:false, afterEach:false */
/*jshint expr: false*/
'use strict';
const sinon = require('sinon');
const expect = require('chai').expect;
const BookAudio = require('../../../src/js/models/BookAudio.jsx');

const EventEmitter = require('events').EventEmitter;

var MockAudio = function(file) {
  var obj = {};
  var emitter = new EventEmitter();

  obj.currentTime = function() { return 10; };
  obj.remove = function() { emitter.removeAllListeners(); };
  obj.preload = function() { return obj; };
  obj.autoplay = function() { return obj; };
  obj.on = function(sig, func) { emitter.on(sig, func); return obj; };
  /* Pretend to play */
  setTimeout(function() { emitter.emit('play'); }, 1);
  /* Pretend to timeupdate */
  setTimeout(function() { emitter.emit('timeupdate'); }, 10);
  /* Pretend to ended */
  setTimeout(function() { emitter.emit('ended'); }, 100);
  return obj;
};

BookAudio.setMock(MockAudio);


describe('BookAudio', function() {
  beforeEach(function() {
    this.bookAudio = new BookAudio();
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
    this.bookAudio.play('word', 'fake-mp3.mp3');
  });

  it('emit event on ended', function(cb) {
    this.bookAudio.bind('word', 'ended', function() {
      expect(true);
      cb();
    });
    this.bookAudio.play('word', 'fake-mp3.mp3');
  });

  it('emit event on timeupdate', function(cb) {
    this.bookAudio.bind('word', 'timeupdate', function(time) {
      expect(time).not.to.be.null; //eslint-disable-line no-unused-expressions
      expect(time).not.to.be.undefined; //eslint-disable-line no-unused-expressions
      cb();
    });
    this.bookAudio.play('word', 'fake-mp3.mp3');
  });
});
