//require('whatwg-fetch'); // polyfill
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

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    if (!this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl + '/';
    }
    this.types = {
      'img': Image
    };
    this.cache = {};
    this.downloadQueue = {};
  }

  getBaseUrl() {
    return this.baseUrl;
  };

  addType(type, cls) {
    this.types[type] = cls;
  };

  queueDownload(type, path, name = path) {
    if (!this.downloadQueue[name]) {
      this.downloadQueue[name] = new Promise((resolve, reject) => {
        var img = new this.types[type]();
        img.addEventListener("load", () => {
          delete this.downloadQueue[name];
          this.cache[name] = img;
          resolve(img);
        }, false);
        img.addEventListener("error", () => {
          reject(img);
        }, false);
        img.src = this.baseUrl + path;

        AssetManager.trigger('started', img);
      });
      this.downloadQueue[name].then(
        (asset) => { AssetManager.trigger('ended', asset); },
        (asset) => { AssetManager.trigger('error', asset); }
      );
    }
    return this.downloadQueue[name];
  }

  getAsset(path) {
    if (!this.cache[path]) { throw new Error(`${path} was not cached`); }
    return this.cache[path];
  }
}

module.exports = AssetManager;
