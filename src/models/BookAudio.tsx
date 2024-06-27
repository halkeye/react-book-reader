// require the core node events module
import { EventEmitter } from 'node:events';
import AssetManager from '../AssetManager';

class BookAudio extends EventEmitter {
  private asset_manager: AssetManager;
  private currentFilename: string | null;
  private playMode: string | null;
  private state: string;
  private asset: any;
  private interval: any;
  private seekInterval: any;

  constructor(asset_manager: AssetManager) {
    super();
    this.asset_manager = asset_manager;
    this.currentFilename = null;
    this.playMode = null;
    this.state = 'paused';
  }

  bind(
    type: string,
    ev: string,
    func: Parameters<EventEmitter['on']>[1]
  ): this {
    this.on(`${type}-${ev}`, func);
    return this;
  }

  pause() {
    this.stopUpdateCurrentDuration();
    if (!this.asset) {
      return this;
    }
    this.asset.pause();
    return this;
  }

  stop() {
    this.stopUpdateCurrentDuration();
    if (!this.asset) {
      return this;
    }
    this.asset.stop();
    this.asset.onEnded();
    return this;
  }

  play(type: string, path: string): this {
    // don't double play
    if (
      this.asset !== null &&
      this.playMode === type &&
      this.currentFilename === path
    ) {
      if (this.asset) {
        this.interval = setInterval(
          this.updateCurrentDuration.bind(this, this.asset, type),
          100
        );
        this.asset.play();
      }
      return this;
    }
    this.asset_manager.getAsset(path).then((asset) => {
      asset = asset.audio;
      this.currentFilename = path;
      this.playMode = type;
      asset.on('play', () => {
        this.state = 'playing';
        this.seekInterval = setInterval(() => {
          const time = asset.seek();
          if (time) {
            this.emit(`${type}-timeupdate`, time);
          }
        }, 100);
        this.emit(`${type}-play`);
      });
      asset.on('pause', () => {
        this.emit(`${type}-pause`);
      });
      asset.onEnded = () => {
        asset.off('play');
        asset.off('pause');
        asset.off('end');
        this.emit(`${type}-ended`);
        if (this.asset === asset) {
          this.playMode = null;
          this.asset = null;
          this.stopUpdateCurrentDuration();
          if (this.seekInterval) {
            clearInterval(this.seekInterval);
            this.seekInterval = 0;
          }
        }
      };
      asset.on('end', asset.onEnded);
      this.interval = setInterval(
        this.updateCurrentDuration.bind(this, asset, type),
        100
      );
      asset.play();

      this.asset = asset;
    });
    return this;
  }

  removeAll() {
    this.removeAllListeners();
    this.stop();
    this.stopUpdateCurrentDuration();
    if (this.asset) {
      this.stop();
    }
  }

  updateCurrentDuration(asset, type) {
    this.emit(`${type}-timeupdate`, asset.pos());
  }

  stopUpdateCurrentDuration() {
    clearInterval(this.interval);
    delete this.interval;
  }
}

export default BookAudio;
