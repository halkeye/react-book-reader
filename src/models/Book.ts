import AssetManager, { Asset, DownloadQueueItem } from '../AssetManager';
import { LanguageCode } from '../atoms';
import {
  AnimFrame,
  GameAnimations,
  audioFilename,
  getAnimFile,
  intToRGBA,
  rewritePageName,
  ucFirst,
} from '../constants/BookUtilities';
import { enumKeys } from '../enumKeys';
import { RawBook, RawBookPage, RawBookStyles } from './RawBook';

export type BookStyles = {
  [StyleDataState.READ]?: BookStyle;
  [StyleDataState.READING]?: BookStyle;
  [StyleDataState.UNREAD]?: BookStyle;
};

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

export interface BookHotspot {
  text: string;
  audio: string;
}

export interface BookImageHotspot {
  mask: string;
  hotspots: Record<string, Array<BookHotspot>>;
}

export interface BookPage {
  id: string;
  assetManager: AssetManager;
  image: string;
  audio: string;
  styles: BookStyles;
  images: Array<BookImage>;
  lines: Array<BookLine>;
  hotspot: BookImageHotspot;
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
    assetManager,
    image: '',
    audio: '',
    lines: [],
    images: [],
    hotspot: {
      mask: '',
      hotspots: {},
    },
    styles: Object.assign(
      {},
      parentStyle,
      processStyleData(assetManager.getBaseUrl(), page.STYLES)
    ),
  };

  if (page.IMAGE) {
    for (const image of page.IMAGE) {
      promises.push(
        assetManager.queueDownload(
          'img',
          `images/${image.FILENAME.replace('[lang]', language)}.png`
        )
      );
      pageData.images.push({
        image: `images/${image.FILENAME.replace('[lang]', language)}.png`,
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100,
      });
    }
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
          `buttons/pg${pageName}_${buttonName}.png`
        )
      );
      pageData.images.push({
        nextPage: nextPageName,
        image: `buttons/pg${pageName}_${buttonName}.png`,
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
      for (const word of line.WORDS) {
        const wordStyle = Object.assign({}, lineStyle);
        promises.push(
          assetManager.queueDownload(
            'audio',
            `voice/${language.toUpperCase()}/spliced/${audioFilename(
              word[0]
            )}.mp3`
          )
        );
        const wordData: BookWord = {
          word: word[0],
          start: word[1],
          end: word[2],
          styles: wordStyle,
          audio: `voice/${language.toUpperCase()}/spliced/${audioFilename(
            word[0]
          )}.mp3`,
        };
        lineData.words.push(wordData);
      }
    }
  }
  if (page.HOTSPOTS) {
    promises.push(
      assetManager.queueDownload('img', `pages/pg${pageName}.hotspots.gif`)
    );
    pageData.hotspot = {
      mask: `pages/pg${pageName}.hotspots.gif`,
      hotspots: {},
    };
    for (const [color, hotspots] of Object.entries(page.HOTSPOTS)) {
      pageData.hotspot.hotspots[color] = [];
      for (const hotspot of hotspots) {
        promises.push(
          assetManager.queueDownload(
            'audio',
            `voice/${language.toUpperCase()}/spliced/${audioFilename(
              hotspot[1]
            )}.mp3`
          )
        );
        pageData.hotspot.hotspots[color].push({
          text: hotspot[0],
          audio: `voice/${language.toUpperCase()}/spliced/${audioFilename(
            hotspot[1]
          )}.mp3`,
        });
      }
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

export type BookStyle = {
  color?: string;
  fontPath?: string;
  fontFamily?: string;
  fontSize?: number;
};

export interface BookGame {
  gameName?: string;
}

export class Book {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly pages: Record<string, BookPage>;
  readonly fonts: Fonts;
  private assetManager: AssetManager;
  language: LanguageCode = LanguageCode.EN;
  games: Record<string, BookGame> = {};
  bookStyles: BookStyles = {};

  constructor(
    id: string,
    title: string,
    icon: string,
    assetBaseUrl: string,
    bookData: RawBook,
    language: LanguageCode
  ) {
    this.assetManager = new AssetManager(assetBaseUrl);
    this.language = language;
    this.id = id;
    this.title = title;
    this.icon = icon;
    this.pages = {};
    this.games = {};
    this.fonts = {};

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

    const gameAnimations: { [K in GameAnimations]?: Array<AnimFrame> } = {};
    for (const animName of enumKeys(GameAnimations)) {
      getAnimFile(
        this.assetManager.getBaseUrl(),
        GameAnimations[animName]
      ).then((frames) => {
        for (const frame of frames) {
          promises.push(this.assetManager.queueDownload('img', frame.filename));
          frame.frame = this.assetManager.getAsset.bind(
            this.assetManager,
            frame.filename
          );
        }
        gameAnimations[GameAnimations[animName]] = frames;
      });
    }
    const gameBoardParts = [
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
    for (const file of ['game_cupbard_door_closed', 'game_cupbard_door_open']) {
      const filename = `game/${file}.png`;
      promises.push(this.assetManager.queueDownload('img', filename));
      gameAssets[file] = filename;
    }
    /* FIXME - move game anims to here so we can do promises with them */

    for (const page of bookData.PAGES[this.language]) {
      const pageNumber = Object.keys(this.pages).length + 1;
      const pageNumberString = `${pageNumber}`.padStart(2, '0');

      this.pages[pageNumber] = pageProcessor({
        promises,
        assetManager: this.assetManager,
        parentStyle: this.bookStyles,
        language: this.language,
        page,
        pageName: pageNumberString,
      });
      const pageData = this.pages[pageNumber];
      pageData.image = `pages/pg${pageNumberString}.png`;
      pageData.audio = `voice/${this.language.toUpperCase()}/page/${pageNumberString}.mp3`;
      promises.push(this.assetManager.queueDownload('audio', pageData.audio));
      promises.push(this.assetManager.queueDownload('img', pageData.image));
    }
    if (bookData.UI) {
      for (const [key, uiData] of Object.entries(bookData.UI)) {
        /* Ignore GAMES key, its not a page - HAACK */
        if (key === 'GAMES') {
          return;
        }

        const lckey = rewritePageName(key.replace(/^PAGE_/, '').toLowerCase());

        this.pages[lckey] = pageProcessor({
          promises,
          assetManager: this.assetManager,
          parentStyle: this.bookStyles,
          language: this.language,
          page: uiData,
          pageName: ucFirst(lckey),
        });
        const pageData = this.pages[lckey];
        pageData.id = lckey;
        pageData.image = `pages/pg${ucFirst(lckey)}.png`;
        this.assetManager.queueDownload('img', pageData.image);
      }
      /*
      if (bookData.UI.GAMES) {
        for (const [gameName, gameData] of Object.entries(bookData.UI.GAMES)) {
          const gameDifficultyKey = `gameDifficulty${gameName}`;
          this.pages[gameDifficultyKey] = pageProcessor({
            promises: promises,
            assetManager: this.assetManager,
            parentStyle: this.bookStyles,
            language: this.language,
            page: gameData,
            pageName: 'GameDifficulty',
            nextPageRewriter: (name) => {
              return `game${gameName}${ucFirst(name)}`;
            },
          });
          const gameDifficultyPageData = this.pages[gameDifficultyKey];
          gameDifficultyPageData.image = `pages/pgGameDifficulty_${gameName}.png`;
          promises.push(
            this.assetManager.queueDownload('img', gameDifficultyPageData.image)
          );
          gameDifficultyPageData.back = 'game';

          book.pages[`game${gameName}Tutorial`] = pageProcessor({
            promises: promises,
            assetManager: this.assetManager,
            parentStyle: book.bookStyles,
            language: this.language,
            page: { LINES: [], HOTSPOTS: {} },
            pageName: `game${gameName}Tutorial`,
          });
          const gameTutorialPageData = book.pages[`game${gameName}Tutorial`];
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
                const boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
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
        }
      }
      */
    }
  }
  hasGame(page: string) {
    return page in this.games;
  }

  hasPage(page: string) {
    return page in this.games || page in this.pages;
  }
}

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
