import { Howl } from 'howler';
import { pEvent } from 'p-event';
import { createContext } from 'react';

export interface AssetManagerEventMap {
  load: Event;
  started: Event;
  finished: Event;
  error: ErrorEvent;
}

type EventName = keyof AssetManagerEventMap;

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
    this.downloadQueue = {};
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async _download(
    type: keyof typeof ASSET_TYPES,
    path: string
  ): Promise<Asset> {
    const assetLoader: AssetType = new ASSET_TYPES[type]();

    try {
      if ('crossOrigin' in assetLoader) {
        assetLoader.crossOrigin = 'anonymous';
      }

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

  // FIXME - type should be enum
  getAsset(
    type: keyof typeof ASSET_TYPES,
    path: string,
    name = path
  ): Promise<Asset> {
    if (!this.downloadQueue[name]) {
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

  getAssetSrc(source: string) {
    return new URL(source, this.baseUrl).toString();
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

const ASSET_TYPES = {
  img: Image,
  audio: AssetManagerAudioType,
};

export const AssetManagerContext = createContext<AssetManager>(
  new AssetManager('')
);
