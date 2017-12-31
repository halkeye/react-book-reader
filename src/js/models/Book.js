import AssetManager from '../AssetManager.js';

export default class Book {
  constructor (assetBaseUrl, language) {
    this.assetManager = new AssetManager(assetBaseUrl);
    this.language = language;
    this.pages = {};
    this.games = {};
    this.promises = [];
  }

  addAssetPromises (promises) {
    this.promises = this.promises.concat(promises);
  }

  hasGame (page) {
    return typeof this.games[page] !== 'undefined';
  }
  hasPage (page) {
    return (
      typeof this.pages[page] !== 'undefined' ||
      typeof this.games[page] !== 'undefined'
    );
  }
}
