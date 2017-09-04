'use strict';
var events = {};
class AssetManager {

  static on(eventName, func) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(func);
  }

  static off(eventName, func) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName] = events[eventName].filter((elm) => {
      return elm !== func;
    });
  }

  static trigger(eventName, asset) {
    if (!events[eventName]) { return; }
    events[eventName].forEach(function(func) {
      func(asset);
    });
  }

  constructor(baseUrl, keepCached = false) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.types = { 'img': Image };
    this.cache = keepCached ? {} : null;
    this.assets = {};
    this.downloadQueue = {};
  }

  getBaseUrl() {
    return this.baseUrl;
  };

  addType(type, cls) {
    this.types[type] = cls;
  };

  _download(type, path) {
    return new Promise((resolve, reject) => {
      var img = new this.types[type]();
      img.addEventListener('load', () => {
        if (this.cache) { this.cache[name] = img; }
        resolve(img, path);
      }, false);
      img.addEventListener('error', () => {
        reject(img, path);
      }, false);
      img.src = this.baseUrl + path;
    });
  }

  queueDownload(type, path, name = path) {
    if (!this.downloadQueue[name]) {
      this.assets[name] = { src: path, type: type };
      AssetManager.trigger('started');
      this.downloadQueue[name] = this._download(type, path);
      this.downloadQueue[name].then(
        (asset) => { AssetManager.trigger('ended', asset); },
        (asset) => { AssetManager.trigger('error', asset); }
      ).then(() => {
        delete this.downloadQueue[name];
      });
    }
    return this.downloadQueue[name];
  }

  getAsset(name) {
    if (!this.cache) {
      // redowload - FIXME
      return this._download(this.assets[name].type, this.assets[name].src);
    }
    if (!this.cache[name]) { throw new Error(`${name} was not cached`); }
    return this.cache[name];
  }

  getAssetSrc(name) {
    return this.baseUrl + this.assets[name].src;
  }

}

module.exports = AssetManager;
