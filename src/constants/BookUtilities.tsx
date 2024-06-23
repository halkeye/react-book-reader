import diacritics from 'diacritics';
import AssetManager, { Asset, DownloadQueueItem } from '../AssetManager';
import Constants from '../constants/AppConstants';
import { LanguageCode } from '../atoms';
import { RawBook, RawBookPage, RawBookStyles } from '../models/RawBook';
import { enumKeys } from '../enumKeys.js';

class BookFrame {
  filename: string;
  nextTiming: number;
  frame?: (asset: Asset) => void;

  constructor(filename: string, nextTiming: number) {
    this.filename = filename;
    this.nextTiming = nextTiming;
  }
}

enum GameAnimations {
  BAD = 'bad',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  POINTING = 'pointing',
}

const getAnimFile = async (
  assetBaseUrl: string,
  animName: string
): Promise<Array<BookFrame>> => {
  const text = await fetch(
    `${assetBaseUrl  }animations/${  animName  }/anim.txt`
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
      new BookFrame(
        `animations/${  animName  }/${  animName  }${frameNo  }.png`,
        parseInt(timing, 10)
      )
    );
  }
  return arr;
};

const rewritePageName = (pageName: string) => {
  pageName += '';
  return pageName
    .replace(/^WP$/, 'gameDifficultyWP')
    .replace(/^PP$/, 'gameDifficultyPP')
    .replace(/^fullMonty$/, 'gameDifficultyfullMonty')
    .replace('readToMe', 'readAudio')
    .replace('readAgain', 'read')
    .replace(/^games$/, 'game');
};

const audioFilename = (filename: string) => {
  filename += '';
  return diacritics
    .remove(filename)
    .toLowerCase()
    .replace(/[^\w ]/g, '')
    .replace(/\s+$/g, '');
};

export const dirname = (path: string | undefined | null) => {
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
    return path;
  }
  return path.replace(/\\/g, '/').replace(/\/[^/]*\/?$/, '');
};

const ucFirst = (str: string) => {
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

  return `rgba(${  [red, green, blue].join(',')  }, ${  alpha  })`;
};

function processStyleData(
  assetBaseUrl: string,
  styleData?: RawBookStyles
): BookStyles {
  const style: BookStyles = {};
  if (!styleData) {
    return {};
  }

  for (const state of enumKeys(StyleDataState)) {
    const stateStyleData = styleData[state];
    if (!stateStyleData) {
      continue;
    }

    const font = stateStyleData.FONT;
    if (font) {
      style[state] = {
        color: intToRGBA(stateStyleData.COLOR),
        fontPath: assetBaseUrl + font,
        fontFamily: font,
        fontSize: stateStyleData.SIZE,
      };
    }
  }
  return style;
}

export type BookStyles = Record<string, BookStyle>;

export interface BookImage {
  image: string;
  top: number;
  left: number;
  height: number;
  width: number;
  nextPage?: string;
}

export interface BookWord {
  word: string;
  start: number;
  end: number;
  styles: BookStyles;
  audio: string;
}

export interface BookLine {
  top: number;
  left: number;
  words: Array<BookWord>;
}

export interface BookPage {
  id: string;
  assetManager: AssetManager;
  image: string;
  audio: string;
  styles: BookStyles;
  images: Array<BookImage>;
  lines: Array<BookLine>;
}

const pageProcessor = ({
  promises,
  assetManager,
  parentStyle,
  language,
  page,
  pageName,
  nextPageRewriter,
}: {
  promises: Array<Promise<Asset>>;
  assetManager: AssetManager;
  parentStyle: BookStyles;
  language: LanguageCode;
  page: RawBookPage;
  pageName: string;
  nextPageRewriter?(p: string): string;
}): BookPage => {
  // HOTSPOTS
  const pageData: BookPage = {
    id: pageName,
    assetManager: assetManager,
    image: '',
    audio: '',
    lines: [],
    images: [],
    styles: Object.assign(
      {},
      parentStyle,
      processStyleData(assetManager.getBaseUrl(), page.STYLES)
    ),
  };

  if (page.IMAGE) {
    page.IMAGE.forEach((image) => {
      promises.push(
        assetManager.queueDownload(
          'img',
          `images/${  image.FILENAME.replace('[lang]', language)  }.png`
        )
      );
      pageData.images.push({
        image: `images/${  image.FILENAME.replace('[lang]', language)  }.png`,
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100,
      });
    });
  }
  if (page.BUTTONS) {
    for (const buttonName of Object.keys(page.BUTTONS)) {
      const image = page.BUTTONS[buttonName];
      let nextPageName = rewritePageName(buttonName);
      if (nextPageRewriter) {
        nextPageName = nextPageRewriter(nextPageName);
      }

      promises.push(
        assetManager.queueDownload(
          'img',
          `buttons/pg${  pageName  }_${  buttonName  }.png`
        )
      );
      pageData.images.push({
        nextPage: nextPageName,
        image: `buttons/pg${  pageName  }_${  buttonName  }.png`,
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100,
      });
    }
  }
  if (page.LINES) {
    for (const line of page.LINES) {
      const lineStyle = Object.assign(
        {},
        pageData.styles,
        processStyleData(assetManager.getBaseUrl(), line.STYLES)
      );
      const lineData: BookLine = {
        top: line.POS[0] * 100,
        left: line.POS[1] * 100,
        words: [],
      };
      pageData.lines.push(lineData);
      for (const word in line.WORDS) {
        const wordStyle = Object.assign({}, lineStyle);
        promises.push(
          assetManager.queueDownload(
            'audio',
            `voice/${ 
              language.toUpperCase() 
              }/spliced/${ 
              audioFilename(word[0]) 
              }.mp3`
          )
        );
        const wordData = {
          word: word[0],
          start: parseFloat(word[1]),
          end: parseFloat(word[2]),
          styles: wordStyle,
          audio:
            `voice/${ 
            language.toUpperCase() 
            }/spliced/${ 
            audioFilename(word[0]) 
            }.mp3`,
        };
        lineData.words.push(wordData);
      }
    }
  }
  if (page.HOTSPOTS) {
    const pageNumStr = (`${pageName  }`).padStart(2, '0');
    promises.push(
      assetManager.queueDownload(
        'img',
        `pages/pg${  pageNumStr  }.hotspots.gif`
      )
    );
    pageData.hotspot = {
      image: `pages/pg${  pageNumStr  }.hotspots.gif`,
      hotspots: {},
    };
    for (const [color, hotspot] of Object.entries(page.HOTSPOTS)) {
      pageData.hotspot.hotspots[color] = [];
      page.HOTSPOTS[color].forEach(function (hotspot) {
        promises.push(
          assetManager.queueDownload(
            'audio',
            `voice/${ 
              language.toUpperCase() 
              }/spliced/${ 
              audioFilename(hotspot[1]) 
              }.mp3`
          )
        );
        pageData.hotspot.hotspots[color].push({
          text: hotspot[0],
          audio:
            `voice/${ 
            language.toUpperCase() 
            }/spliced/${ 
            audioFilename(hotspot[1]) 
            }.mp3`,
        });
      });
    }
  }
  return pageData;
};

export interface StyleData {
  FONT: string;
  COLOR: number;
  SIZE: number;
}

export enum StyleDataState {
  READ = 'READ',
  READING = 'READING',
  UNREAD = 'UNREAD',
}

export interface BookStyle {
  color: string;
  fontPath: string;
  fontFamily: string;
  fontSize: number;
}

export class Book {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly pages?: Array<BookPage>;
  private assetManager: AssetManager;
  language: LanguageCode = LanguageCode.EN;
  games = {};
  bookStyles: Record<string, Record<string, string | number>> = {};

  constructor(
    id: string,
    title: string,
    icon: string,
    assetBaseUrl: string,
    bookData: RawBook,
    language: LanguageCode
  ) {
    (this.assetManager = new AssetManager(assetBaseUrl)),
      (this.language = language);
    this.id = id;
    this.title = title;
    this.icon = icon;
    this.pages = [];
    this.games = [];

    const promises: Array<Promise<DownloadQueueItem>> = [];

    promises.push(this.assetManager.queueDownload('img', 'pages/gameEnd.png'));

    promises.push(
      this.assetManager.queueDownload(
        'img',
        `game/gameEnd_title_${this.language}.png`,
        'game/gameEnd_title.png'
      )
    );
    promises.push(
      this.assetManager.queueDownload(
        'img',
        `buttons/gameEnd_playAgain-${this.language}.png`,
        'buttons/gameEnd_playAgain.png'
      )
    );
    promises.push(
      this.assetManager.queueDownload(
        'img',
        `buttons/gameEnd_changeDiff-${this.language}.png`,
        'buttons/gameEnd_changeDiff.png'
      )
    );
    promises.push(
      this.assetManager.queueDownload(
        'img',
        `buttons/gameEnd_backGameMenu-${this.language}.png`,
        'buttons/gameEnd_backGameMenu.png'
      )
    );

    promises.push(
      this.assetManager.queueDownload('img', 'buttons/control_back.png')
    );
    promises.push(
      this.assetManager.queueDownload('img', 'buttons/control_home.png')
    );
    promises.push(
      this.assetManager.queueDownload('img', 'buttons/control_pause.png')
    );
    promises.push(
      this.assetManager.queueDownload('img', 'buttons/control_play.png')
    );
    promises.push(
      this.assetManager.queueDownload('img', 'buttons/control_settings.png')
    );

    promises.push(
      this.assetManager.queueDownload('audio', 'game/game_cupbard_correct.mp3')
    );
    promises.push(
      this.assetManager.queueDownload(
        'audio',
        'game/game_cupbard_incorrect.mp3'
      )
    );
    promises.push(
      this.assetManager.queueDownload(
        'audio',
        'game/game_cupbard_door_sound.mp3'
      )
    );

    this.bookStyles = processStyleData(
      this.assetManager.getBaseUrl(),
      bookData.STYLES
    );

    const gameAnimations: { [K in GameAnimations]?: Array<BookFrame> } = {};
    // const gameAnimations: Record<GameAnimations, (Array<BookFrame> | undefined)> = {};

    for (const animName of enumKeys(GameAnimations)) {
      getAnimFile(
        this.assetManager.getBaseUrl(),
        GameAnimations[animName]
      ).then((frames) => {
        frames.forEach((frame) => {
          promises.push(this.assetManager.queueDownload('img', frame.filename));
          frame.frame = this.assetManager.getAsset.bind(
            this.assetManager,
            frame.filename
          );
        });
        gameAnimations[GameAnimations[animName]] = frames;
      });
    }
    let gameBoardParts = {};
    gameBoardParts = [
      'apples',
      'bread',
      'cereal',
      'cheese',
      'cherries',
      'cupcake',
      'ham',
      'hotdog',
      'milk',
      'mushrooms',
      'olives',
      'pbNj',
      'pears',
      'pie',
      'rice',
      'sardine',
      'soup',
      'sundae',
      'tomatoes',
      'waffles',
    ].map((piece) => {
      const data = {
        key: piece,
        image: `game_board_assets/game_board_image_${piece}.png`,
        text: `game_board_assets/game_board_text_${piece}-${this.language}.png`,
      };
      promises.push(this.assetManager.queueDownload('img', data.image));
      promises.push(this.assetManager.queueDownload('img', data.text));

      return data;
    });

    const gameAssets: Record<string, string> = {};
    ['game_cupbard_door_closed', 'game_cupbard_door_open'].forEach((file) => {
      const filename = `game/${  file  }.png`;
      promises.push(this.assetManager.queueDownload('img', filename));
      gameAssets[file] = filename;
    });
    /* FIXME - move game anims to here so we can do promises with them */

    this.pages[0] = null;
    for (const page of bookData.PAGES[this.language]) {
      const pageNum = this.pages.length + 1;
      const pageNumStr = (`${pageNum  }`).padStart(2, '0');

      this.pages[pageNum] = pageProcessor({
        promises: promises,
        assetManager: this.assetManager,
        parentStyle: this.bookStyles,
        language: this.language,
        page: page,
        pageName: pageNum,
      });
      const pageData = this.pages[pageNum];
      pageData.image = `pages/pg${pageNumStr}.png`;
      pageData.audio = `voice/${this.language.toUpperCase()}/page/${pageNumStr}.mp3`;
      promises.push(this.assetManager.queueDownload('audio', pageData.audio));
      promises.push(this.assetManager.queueDownload('img', pageData.image));
    }
    if (bookData.UI) {
      for (const key in Object.keys(bookData.UI)) {
        /* Ignore GAMES key, its not a page - HAACK */
        if (key === 'GAMES') {
          return;
        }
        const lckey = parseInt(
          rewritePageName(key.replace(/^PAGE_/, '').toLowerCase()),
          10
        );

        this.pages[lckey] = pageProcessor({
          promises: promises,
          assetManager: this.assetManager,
          parentStyle: book.bookStyles,
          language: this.language,
          page: bookData.UI[key],
          pageName: ucFirst(lckey),
        });
        const pageData = this.pages[lckey];
        pageData.id = lckey;
        pageData.image = `pages/pg${  ucFirst(lckey)  }.png`;
        this.assetManager.queueDownload('img', pageData.image);
      }
      if (bookData.UI.GAMES) {
        Object.keys(bookData.UI.GAMES).forEach((gameName) => {
          const gameDifficultyKey = `gameDifficulty${gameName}`;
          const gameDifficultyPageData = (book.pages[gameDifficultyKey] =
            pageProcessor({
              promises: promises,
              assetManager: this.assetManager,
              parentStyle: book.bookStyles,
              language: this.language,
              page: bookData.UI.GAMES[gameName],
              pageName: 'GameDifficulty',
              nextPageRewriter: (name) => {
                return `game${gameName}${ucFirst(name)}`;
              },
            }));
          gameDifficultyPageData.image = `pages/pgGameDifficulty_${gameName}.png`;
          promises.push(
            this.assetManager.queueDownload('img', gameDifficultyPageData.image)
          );
          gameDifficultyPageData.back = 'game';

          const gameTutorialPageData = (book.pages[`game${gameName}Tutorial`] =
            pageProcessor({
              promises: promises,
              assetManager: this.assetManager,
              parentStyle: book.bookStyles,
              language: this.language,
              page: {},
              pageName: `game${gameName}Tutorial`,
            }));
          gameTutorialPageData.image = `pages/tutorial_${gameName}_${this.language}.png`;
          gameTutorialPageData.back = `gameDifficulty${gameName}`;
          promises.push(
            this.assetManager.queueDownload('img', gameTutorialPageData.image)
          );

          ['easy', 'medium', 'hard'].forEach((difficulty) => {
            const gameKey = `game${gameName}${ucFirst(difficulty)}`;
            const difficultyPageData = (book.games[gameKey] = pageProcessor({
              promises: promises,
              assetManager: this.assetManager,
              parentStyle: book.bookStyles,
              language: this.language,
              page: bookData.UI.GAMES[gameName][difficulty],
              pageName: gameKey,
            }));
            difficultyPageData.image = `pages/pgGame${gameName}_${difficulty}.png`;
            promises.push(
              this.assetManager.queueDownload('img', difficultyPageData.image)
            );
            difficultyPageData.gameName = gameName;
            difficultyPageData.back = `gameDifficulty${gameName}`;
            difficultyPageData.gameBoardParts = gameBoardParts;
            difficultyPageData.gameAnimations = gameAnimations;
            difficultyPageData.gameAssets = {};
            Object.keys(gameAssets).forEach((value) => {
              difficultyPageData.gameAssets[value] = gameAssets[value];
            });

            difficultyPageData.boxes = {};
            ['tries', 'match', 'reactionBox', 'displayBox'].forEach(
              (boxName) => {
                if (!bookData.UI.GAMES[gameName][difficulty][boxName]) {
                  return;
                }
                const boxData =
                  bookData.UI.GAMES[gameName][difficulty][boxName];
                /* FIXME */
                difficultyPageData.boxes[boxName] = {
                  top: boxData[0] * Constants.Dimensions.HEIGHT,
                  left: boxData[1] * Constants.Dimensions.WIDTH,
                  height: boxData[2] * Constants.Dimensions.HEIGHT,
                  width: boxData[3] * Constants.Dimensions.WIDTH,
                };
              }
            );
            ['matchLocs'].forEach((boxName) => {
              if (!bookData.UI.GAMES[gameName][difficulty][boxName]) {
                return;
              }
              const boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
              /* FIXME */
              difficultyPageData.boxes[boxName] = boxData.map((data) => {
                return {
                  top: data[0] * Constants.Dimensions.HEIGHT,
                  left: data[1] * Constants.Dimensions.WIDTH,
                  height: data[2] * Constants.Dimensions.HEIGHT,
                  width: data[3] * Constants.Dimensions.WIDTH,
                };
              });
            });
          });
        });
      }
    }
    book.hasGame = function (page) {
      return typeof book.games[page] !== 'undefined';
    };
    book.hasPage = function (page) {
      return (
        typeof book.pages[page] !== 'undefined' ||
        typeof book.games[page] !== 'undefined'
      );
    };
    return Promise.all(promises);
  }
}
