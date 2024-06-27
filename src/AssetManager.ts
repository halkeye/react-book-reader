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

type EventFunction = (asset: Asset | null) => void;

const events: Record<EventName, Array<EventFunction>> = {
  load: [],
  started: [],
  finished: [],
  error: [],
};

class AssetManager {
  private baseUrl: string;
  private types: Record<string, AssetManagerTypeConstructor>;
  private assets: Record<string, Asset> = {};
  private downloadQueue: Record<string, Promise<DownloadQueueItem>> = {};

  static on(eventName: EventName, func: EventFunction) {
    events[eventName].push(func);
  }

  static off(eventName: EventName, func: EventFunction) {
    events[eventName] = events[eventName].filter((callback) => {
      return callback !== func;
    });
  }

  static trigger(eventName: EventName, asset: Asset | null) {
    for (const func of events[eventName]) {
      func(asset);
    }
  }

  constructor(baseUrl: string, keepCached = false) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.types = {
      img: Image,
      audio: AssetManagerAudioType,
    };

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
      const asset: AssetType = new this.types[type]();
      asset.addEventListener(
        'load',
        () => {
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
      this.assets[name] = { asset: null, src: path, type };
      AssetManager.trigger('started', null);
      this.downloadQueue[name] = this._download(type, path);
      this.downloadQueue[name]
        .then(
          (asset) => {
            AssetManager.trigger('finished', asset);
          },
          (error) => {
            AssetManager.trigger('error', error);
          }
        )
        .then(() => {
          delete this.downloadQueue[name];
        });
    }
    return this.downloadQueue[name];
  }

  getAsset(name: string): Promise<Asset> {
    if (name in this.assets) {
      return Promise.reolve(this.assets[name]);
    }
    // redowload - FIXME
    return this._download(this.assets[name].type, this.assets[name].src);
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

  set src(value: string) {
    const urls = [value.replace(/.mp3$/, '.ogg'), value];
    this.urls = urls;
    this.audio = new Howl({
      src: this.urls,
      onload: () => {
        this.events.load(new Event('load'));
        this.events.load = () => {};
      },
      onloaderror: (_soundId, error) => {
        if (error instanceof Error) {
          this.events.error(new ErrorEvent(error.message));
        } else {
          this.events.error(new ErrorEvent(`Unknown: ${JSON.stringify(error)}`));
        }
        this.events.error = () => {};
      },
    });
  }
}
