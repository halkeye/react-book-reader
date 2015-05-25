//require('whatwg-fetch'); // polyfill
class AssetManager {
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
      });
    }
    return this.downloadQueue[name];
  }

  getAsset(path) {
    if (!this.cache[path]) { throw new Error(`${path} was not cached`); }
    return this.cache[path];
  }
}

module.exports = AssetManager;
