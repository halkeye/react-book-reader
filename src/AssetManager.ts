import { Howl } from 'howler';
import { pEvent } from 'p-event';

export interface AssetManagerEventMap {
  load: Event;
  started: Event;
  finished: Event;
  error: ErrorEvent;
}

type EventName = keyof AssetManagerEventMap;

export interface AssetManagerTypeConstructor {
  new (): AssetType;
}

export type AssetType = HTMLImageElement | AssetManagerAudioType;

export interface Asset {
  src: string;
  asset?: AssetType;
  type: string;
}

type EventFunction = (asset: Asset | undefined) => void;

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
  private downloadQueue: Record<string, Promise<Asset>> = {};

  static on(eventName: EventName, func: EventFunction) {
    events[eventName].push(func);
  }

  static off(eventName: EventName, func: EventFunction) {
    events[eventName] = events[eventName].filter((callback) => {
      return callback !== func;
    });
  }

  static trigger(eventName: EventName, asset?: Asset) {
    for (const func of events[eventName]) {
      func(asset);
    }
  }

  constructor(baseUrl: string) {
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

  async _download(type: string, path: string): Promise<Asset> {
    const assetLoader: AssetType = new this.types[type]();

    try {
      if ('src' in assetLoader) {
        assetLoader.src = new URL(path, this.baseUrl).toString();
      }

      await pEvent(assetLoader, 'load');

      return { asset: assetLoader, type, src: path };
    } catch (error) {
      console.error('error loading asset', error);
      throw error;
    }
  }

  queueDownload(type: string, path: string, name = path) {
    if (!this.downloadQueue[name]) {
      this.assets[name] = { asset: undefined, src: path, type };
      AssetManager.trigger('started');
      this.downloadQueue[name] = this._download(type, path)
        .then((asset) => {
          AssetManager.trigger('finished', asset);
          return asset;
        })
        .catch((error) => {
          AssetManager.trigger('error', error);
          console.error(`error downloading asset ${path}`, error);
          throw error;
        })
        .finally(() => {
          delete this.downloadQueue[name];
        });
    }
    return this.downloadQueue[name];
  }

  getAsset(name: string): Promise<Asset> {
    if (name in this.assets) {
      return Promise.resolve(this.assets[name]);
    }
    // redowload - FIXME
    return this._download(this.assets[name].type, this.assets[name].src);
  }

  getAssetSrc(name: string) {
    return this.baseUrl + this.assets[name].src;
  }
}

export default AssetManager;

export class AssetManagerAudioType {
  public audio: Howl | undefined;

  private events: Record<keyof AssetManagerEventMap, (ev: Event) => void> = {
    load: () => {},
    started: () => {},
    finished: () => {},
    error: () => {},
  };

  private urls: Array<string> = [];

  removeEventListener(type: keyof AssetManagerEventMap) {
    this.events[type] = () => {};
  }

  addEventListener(
    type: keyof AssetManagerEventMap,
    listener: (ev: Event) => void
  ): void {
    this.events[type] = listener;
  }

  set src(value: string) {
    const urls = [value, value.replace(/.mp3$/, '.ogg')];
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
          this.events.error(
            new ErrorEvent(`Unknown: ${JSON.stringify(error)}`)
          );
        }
        this.events.error = () => {};
      },
    });
  }
}
