import diacritics from 'diacritics';
import { Asset } from '../AssetManager';

export class AnimFrame {
  filename: string;
  nextTiming: number;
  frame?: (asset: Asset) => void;

  constructor(filename: string, nextTiming: number) {
    this.filename = filename;
    this.nextTiming = nextTiming;
  }
}

export enum GameAnimations {
  BAD = 'bad',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  POINTING = 'pointing',
}

export const getAnimFile = async (
  assetBaseUrl: string,
  animName: string
): Promise<Array<AnimFrame>> => {
  const text = await fetch(
    `${assetBaseUrl}animations/${animName}/anim.txt`
  ).then((response) => response.text());
  const arr = [];
  for (const line of text
    .replace('\r', '\n')
    .replace(/\n+/, '\n')
    .split('\n')) {
    if (!line) {
      continue;
    }
    const [frameNo, timing] = line.split(',');
    arr.push(
      new AnimFrame(
        `animations/${animName}/${animName}${frameNo}.png`,
        parseInt(timing, 10)
      )
    );
  }
  return arr;
};

export const rewritePageName = (pageName: string) => {
  pageName += '';
  return pageName
    .replace(/^WP$/, 'gameDifficultyWP')
    .replace(/^PP$/, 'gameDifficultyPP')
    .replace(/^fullMonty$/, 'gameDifficultyfullMonty')
    .replace('readToMe', 'readAudio')
    .replace('readAgain', 'read')
    .replace(/^games$/, 'game');
};

export const audioFilename = (filename: string) => {
  filename += '';
  return diacritics
    .remove(filename)
    .toLowerCase()
    .replace(/[^\w ]/g, '')
    .replace(/\s+$/g, '');
};

export const dirname = (path: string | undefined | null): string => {
  //  discuss at: http://phpjs.org/functions/dirname/
  // original by: Ozh
  // improved by: XoraX (http://www.xorax.info)
  //   example 1: dirname('/etc/passwd');
  //   returns 1: '/etc'
  //   example 2: dirname('c:/Temp/x');
  //   returns 2: 'c:/Temp'
  //   example 3: dirname('/dir/test/');
  //   returns 3: '/dir'

  if (!path) {
    return '';
  }
  return path.replace(/\\/g, '/').replace(/\/[^/]*\/?$/, '');
};

export const ucFirst = (str: string) => {
  str += '';
  const f = str.charAt(0).toUpperCase();
  return f + str.substring(1).toLowerCase();
};

export interface Color {
  a: number;
  r: number;
  g: number;
  b: number;
}

export const colorToInt = (color: Color) => {
  return (color.a << 24) | (color.r << 16) | (color.g << 8) | (color.b << 0);
};

export const intToRGBA = (colorInt: number) => {
  const alpha = ((colorInt >> 24) & 255) / 255;
  const red = (colorInt >> 16) & 255;
  const green = (colorInt >> 8) & 255;
  const blue = (colorInt >> 0) & 255;

  return `rgba(${[red, green, blue].join(',')}, ${alpha})`;
};

export function isKeyInObject<T extends object>(
  obj: T,
  key: string | number | symbol
): key is keyof T {
  return obj[key as keyof typeof obj] !== undefined;
}
