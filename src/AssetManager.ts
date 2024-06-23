import { Howl } from 'howler';
export interface AssetManagerEventMap {
  load: Event;
  started: Event;
  finished: Event;
  error: ErrorEvent;
}

type EventName = keyof AssetManagerEventMap;

export interface AssetManagerType {
  addEventListener(
    type: EventName,
    listener: (ev: Event) => void,
    options?: boolean
  ): void;
  removeEventListener<K extends keyof AssetManagerEventMap>(
    type: K,
    listener: (ev: AssetManagerEventMap[K]) => void
  ): void;
}

export interface AssetManagerTypeConstructor {
  new (): AssetType;
}

export interface AssetType extends AssetManagerType {}

export interface Asset {
  src: string;
  asset: AssetType | null;
  type: string;
}

export type DownloadQueueItem = Asset;

type EventFunc = (asset: Asset | null) => void;

const events: Record<EventName, Array<EventFunc>> = {
  load: [],
  started: [],
  finished: [],
  error: [],
};

class AssetManager {
  private baseUrl: string;
  private cache: Record<string, unknown> | null;
  private types: Record<string, AssetManagerTypeConstructor>;
  private assets: Record<string, Asset> = {};
  private downloadQueue: Record<string, Promise<DownloadQueueItem>> = {};

  static on(eventName: EventName, func: EventFunc) {
    events[eventName].push(func);
  }

  static off(eventName: EventName, func: EventFunc) {
    events[eventName] = events[eventName].filter((cb) => {
      return cb !== func;
    });
  }

  static trigger(eventName: EventName, asset: Asset | null) {
    events[eventName].forEach(function (func) {
      func(asset);
    });
  }

  constructor(baseUrl: string, keepCached = false) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.types = {
      img: Image,
      audio: AssetManagerAudioType,
    };

    this.cache = keepCached ? {} : null;
    this.assets = {};
    this.downloadQueue = {};
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  addType(type: string, cls: AssetManagerTypeConstructor) {
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
            AssetManager.trigger('finished', asset);
          },
          (err) => {
            AssetManager.trigger('error', err);
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

class AssetManagerAudioType implements AssetManagerType {
  public audio: Howl | undefined;

  private events: Record<keyof AssetManagerEventMap, (ev: Event) => void> = {
    load: () => {},
    started: () => {},
    finished: () => {},
    error: () => {},
  };

  private urls: Array<string> = [];

  removeEventListener() {
    throw new Error('Method not implemented.');
  }

  addEventListener(
    type: keyof AssetManagerEventMap,
    listener: (ev: Event) => void
  ): void {
    this.events[type] = listener;
  }

  set src(val: string) {
    const urls = [val.replace(/.mp3$/, '.ogg'), val];
    this.urls = urls;
    this.audio = new Howl({
      src: this.urls,
      onload: () => {
        this.events.load(new Event('load'));
        this.events.load = () => {};
      },
      onloaderror: (_soundId, err) => {
        if (err instanceof Error) {
          this.events.error(new ErrorEvent(err.message));
        } else {
          this.events.error(new ErrorEvent(`Unknown: ${JSON.stringify(err)}`));
        }
        this.events.error = () => {};
      },
    });
  }
}
