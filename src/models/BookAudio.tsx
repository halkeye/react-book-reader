import AssetManager, { AssetManagerAudioType } from '../AssetManager';
import { Howl } from 'howler';

export class TimeUpdateEvent extends Event {
  time: number;
  constructor(type: string, time: number) {
    super(`${type}-timeupdate`);
    this.time = time;
  }
}

export class PlayEvent extends Event {
  constructor(type: string) {
    super(`${type}-play`);
  }
}

export class PauseEvent extends Event {
  constructor(type: string) {
    super(`${type}-pause`);
  }
}

export class EndedEvent extends Event {
  constructor(type: string) {
    super(`${type}-ended`);
  }
}

export class BookAudio extends EventTarget {
  private assetManager: AssetManager;
  private currentFilename?: string;
  private playMode?: string;
  private state: string;
  private audioAsset?: Howl;
  private interval?: NodeJS.Timeout;
  private seekInterval?: NodeJS.Timeout;

  constructor(asset_manager: AssetManager) {
    super();
    this.assetManager = asset_manager;
    this.currentFilename = undefined;
    this.playMode = undefined;
    this.state = 'paused';
  }

  bind(
    type: string,
    eventName: string,
    func: Parameters<EventTarget['addEventListener']>[1]
  ): this {
    this.addEventListener(`${type}-${eventName}`, func);
    return this;
  }

  pause() {
    this.stopUpdateCurrentDuration();
    if (!this.audioAsset) {
      return this;
    }
    this.audioAsset.pause();
    return this;
  }

  stop() {
    this.stopUpdateCurrentDuration();
    if (!this.audioAsset) {
      return this;
    }
    this.audioAsset.stop();
    // FIXME - is this still needed
    // this.audioAsset.onEnded();
    return this;
  }

  play(type: string, path: string): this {
    // don't double play
    if (
      this.audioAsset !== null &&
      this.playMode === type &&
      this.currentFilename === path
    ) {
      if (this.audioAsset) {
        this.interval = setInterval(
          this.updateCurrentDuration.bind(this, this.audioAsset, type),
          100
        );
        this.audioAsset.play();
      }
      return this;
    }
    this.assetManager
      .getAsset('audio', path)
      .then((asset) => {
        if (!(asset.asset instanceof AssetManagerAudioType)) {
          throw new TypeError(`trying to play non audio ${path}`);
        }
        if (!asset.asset.audio) {
          throw new Error(`audio asset without audio ${path}`);
        }
        const audioAsset = asset.asset.audio;
        this.currentFilename = path;
        this.playMode = type;
        audioAsset.on('play', () => {
          this.state = 'playing';
          this.seekInterval = setInterval(() => {
            const time = audioAsset.seek();
            if (time) {
              this.dispatchEvent(new TimeUpdateEvent(type, time));
            }
          }, 100);
          this.dispatchEvent(new PlayEvent(type));
        });
        audioAsset.on('pause', () => {
          this.dispatchEvent(new PauseEvent(type));
        });
        audioAsset.on('end', () => {
          audioAsset.off('play');
          audioAsset.off('pause');
          audioAsset.off('end');
          this.dispatchEvent(new EndedEvent(type));
          if (this.audioAsset === audioAsset) {
            this.playMode = undefined;
            this.audioAsset = undefined;
            this.stopUpdateCurrentDuration();
            if (this.seekInterval) {
              clearInterval(this.seekInterval);
              this.seekInterval = undefined;
            }
          }
        });
        // FIXME - is this still needed
        // audioAsset.on('end', asset.onEnded);
        this.interval = setInterval(
          () => this.updateCurrentDuration(audioAsset, type),
          100
        );
        audioAsset.play();

        this.audioAsset = audioAsset;
        return;
      })
      .catch((error) => {
        // fIXME - better error handling
        console.error('unable to load audio', error);
      });
    return this;
  }

  removeAll() {
    // FIXME - no longer exists
    // this.removeAllListeners();
    this.stop();
    this.stopUpdateCurrentDuration();
    if (this.audioAsset) {
      this.stop();
    }
  }

  updateCurrentDuration(asset: Howl, type: string) {
    const position = asset.seek();
    this.dispatchEvent(new TimeUpdateEvent(type, position));
  }

  stopUpdateCurrentDuration() {
    clearInterval(this.interval);
    delete this.interval;
  }
}
