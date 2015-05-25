//require('whatwg-fetch'); // polyfill
function AssetManager(baseUrl) {
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

AssetManager.prototype.getBaseUrl = function() {
  return this.baseUrl;
};

AssetManager.prototype.addType = function(type, cls) {
  this.types[type] = cls;
};

AssetManager.prototype.queueDownload = function(type, path) {
  if (!this.downloadQueue[path]) {
    this.downloadQueue[path] = new Promise((resolve, reject) => {
      var img = new this.types[type]();
      img.addEventListener("load", () => {
        delete this.downloadQueue[path];
        this.cache[path] = img;
        resolve(img);
      }, false);
      img.addEventListener("error", () => {
        console.log('reject', arguments);
        reject(img);
      }, false);
      img.src = this.baseUrl + path;
    });
  }
  return this.downloadQueue[path];
};

AssetManager.prototype.getAsset = function(path) {
  if (!this.cache[path]) { throw new Error(`${path} was not cached`); }
  return this.cache[path];
};

module.exports = AssetManager;
