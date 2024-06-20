type EventName = string;

export interface HTMLElementConstructor {
  new (): HTMLElement;
}

export interface AssetType extends HTMLElement {}

export interface Asset {
  src: string;
  asset: AssetType | null;
  type: string;
}

export type DownloadQueueItem = Asset;

type EventFunc = (asset: Asset | null) => void;

const events: Record<EventName, Array<EventFunc>> = {};

class AssetManager {
  private baseUrl: string;
  private cache: Record<string, unknown> | null;
  private types: Record<string, HTMLElementConstructor>;
  private assets: Record<string, Asset> = {};
  private downloadQueue: Record<string, Promise<DownloadQueueItem>> = {};

  static on(eventName: EventName, func: EventFunc) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(func);
  }

  static off(eventName: EventName, func: EventFunc) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName] = events[eventName].filter((cb) => {
      return cb !== func;
    });
  }

  static trigger(eventName: EventName, asset: Asset | null) {
    if (!events[eventName]) {
      return;
    }

    events[eventName].forEach(function (func) {
      func(asset);
    });
  }

  constructor(baseUrl: string, keepCached = false) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.types = { img: Image };
    this.cache = keepCached ? {} : null;
    this.assets = {};
    this.downloadQueue = {};
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  addType(type: string, cls: HTMLElementConstructor) {
    this.types[type] = cls;
  }

  _download(type: string, path: string): Promise<DownloadQueueItem> {
    return new Promise((resolve, reject) => {
      const asset = new this.types[type]();
      asset.addEventListener(
        'load',
        () => {
          if (this.cache) {
            this.cache[path] = asset;
          }
          resolve({ asset, type, src: path });
        },
        false
      );
      asset.addEventListener(
        'error',
        () => {
          reject({ asset, type, src: path });
        },
        false
      );
      if ('src' in asset) {
        asset.src = `${this.baseUrl}${path}`;
      }
    });
  }

  queueDownload(type: string, path: string, name = path) {
    if (!this.downloadQueue[name]) {
      this.assets[name] = { asset: null, src: path, type: type };
      AssetManager.trigger('started', null);
      this.downloadQueue[name] = this._download(type, path);
      this.downloadQueue[name]
        .then(
          (asset) => {
            AssetManager.trigger('ended', asset);
          },
          (asset) => {
            AssetManager.trigger('error', asset);
          }
        )
        .then(() => {
          delete this.downloadQueue[name];
        });
    }
    return this.downloadQueue[name];
  }

  getAsset(name: string) {
    if (!this.cache) {
      // redowload - FIXME
      return this._download(this.assets[name].type, this.assets[name].src);
    }
    if (!this.cache[name]) {
      throw new Error(`${name} was not cached`);
    }
    return this.cache[name];
  }

  getAssetSrc(name: string) {
    return this.baseUrl + this.assets[name].src;
  }
}

export default AssetManager;
