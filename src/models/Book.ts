import { CSSProperties } from 'react';
import AssetManager, { Asset } from '../AssetManager';
import { LanguageCode } from '../atoms';
import Constants from '../constants/AppConstants';
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
import { Fonts } from '../hooks/useFonts';
import {
  RawBook,
  RawBookDifficulties,
  RawBookGame,
  RawBookGameDetails,
  RawBookGames,
  RawBookPage,
  RawBookScreen,
  RawBookStyles,
} from './RawBook';

export type BookStyles = {
  [StyleDataState.READ]?: BookStyle;
  [StyleDataState.READING]?: BookStyle;
  [StyleDataState.UNREAD]?: BookStyle;
};

export interface BookItemPosition {
  top: CSSProperties['top'];
  left: CSSProperties['left'];
  height: CSSProperties['height'];
  width: CSSProperties['width'];
}

export interface BookImage extends BookItemPosition {
  image: string;
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

export type BookScreen = {
  back: string;
  id: string;
  image: string;
  styles: BookStyles;
  images: Array<BookImage>;
};

export interface BookPage extends BookScreen {
  audio: string;
  lines: Array<BookLine>;
  hotspot: BookImageHotspot;
}

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

interface BookGameParts {
  key: string;
  image: string;
  text: string;
}

interface BookGameBoxes {
  tries?: BookItemPosition;
  match?: BookItemPosition;
  reactionBox?: BookItemPosition;
  displayBox?: BookItemPosition;
  matchLocs: Array<BookItemPosition>;
}

export interface BookGame extends BookPage {
  boxes: BookGameBoxes;
  gameAssets: Record<string, string>;
  gameAnimations: {
    bad?: Array<AnimFrame>;
    good?: Array<AnimFrame>;
    neutral?: Array<AnimFrame>;
    pointing?: Array<AnimFrame>;
  };
  gameBoardParts: Array<BookGameParts>;
  gameName?: string;
}

export class Book {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly pages: Record<string, BookPage>;
  readonly fonts: Fonts;
  private assetManager: AssetManager;
  private promises: Array<Promise<Asset>> = [];

  language: LanguageCode = LanguageCode.EN;
  games: Record<string, BookGame> = {};
  bookStyles: BookStyles = {};

  finishLoading() {
    return Promise.all(this.promises);
  }

  constructor(
    id: string,
    title: string,
    icon: string,
    bookData: RawBook,
    language: LanguageCode,
    assetManager: AssetManager
  ) {
    this.assetManager = assetManager;
    this.language = language;
    this.id = id;
    this.title = title;
    this.icon = icon;
    this.pages = {};
    this.games = {};
    this.fonts = {};

    this.promises.push(
      this.assetManager.getAsset('img', 'pages/gameEnd.png'),
      this.assetManager.getAsset(
        'img',
        `game/gameEnd_title_${this.language}.png`,
        'game/gameEnd_title.png'
      ),
      this.assetManager.getAsset(
        'img',
        `buttons/gameEnd_playAgain-${this.language}.png`,
        'buttons/gameEnd_playAgain.png'
      ),
      this.assetManager.getAsset(
        'img',
        `buttons/gameEnd_changeDiff-${this.language}.png`,
        'buttons/gameEnd_changeDiff.png'
      ),
      this.assetManager.getAsset(
        'img',
        `buttons/gameEnd_backGameMenu-${this.language}.png`,
        'buttons/gameEnd_backGameMenu.png'
      ),
      this.assetManager.getAsset('img', 'buttons/control_back.png'),
      this.assetManager.getAsset('img', 'buttons/control_home.png'),
      this.assetManager.getAsset('img', 'buttons/control_pause.png'),
      this.assetManager.getAsset('img', 'buttons/control_play.png'),
      this.assetManager.getAsset('img', 'buttons/control_settings.png'),
      this.assetManager.getAsset('audio', 'game/game_cupbard_correct.mp3'),
      this.assetManager.getAsset('audio', 'game/game_cupbard_incorrect.mp3'),
      this.assetManager.getAsset('audio', 'game/game_cupbard_door_sound.mp3')
    );

    this.bookStyles = this.processStyleData(bookData.STYLES);

    const gameAnimations: { [K in GameAnimations]?: Array<AnimFrame> } = {};
    for (const animName of enumKeys(GameAnimations)) {
      getAnimFile(this.assetManager.getBaseUrl(), GameAnimations[animName])
        .then((frames) => {
          for (const frame of frames) {
            frame.frame = this.assetManager.getAsset('img', frame.filename);
            this.promises.push(frame.frame);
          }
          gameAnimations[GameAnimations[animName]] = frames;
          return;
        })
        .catch((error) => {
          // FIXME - handle error better
          console.error('Unable to load animation', error);
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

      this.promises.push(
        this.assetManager.getAsset('img', data.image),
        this.assetManager.getAsset('img', data.text)
      );

      return data;
    });

    const gameAssets: Record<string, string> = {};
    for (const file of ['game_cupbard_door_closed', 'game_cupbard_door_open']) {
      const filename = `game/${file}.png`;
      this.promises.push(this.assetManager.getAsset('img', filename));
      gameAssets[file] = filename;
    }

    /* FIXME - move game anims to here so we can do promises with them */
    for (const page of bookData.PAGES[this.language]) {
      const pageNumber = Object.keys(this.pages).length + 1;
      const pageNumberString = `${pageNumber}`.padStart(2, '0');

      this.pages[pageNumber] = this.pageProcessor({
        parentStyle: this.bookStyles,
        language: this.language,
        page,
        pageName: pageNumberString,
      });
      const pageData = this.pages[pageNumber];
      pageData.image = `pages/pg${pageNumberString}.png`;
      pageData.audio = `voice/${this.language.toUpperCase()}/page${pageNumberString}.mp3`;
      this.promises.push(
        this.assetManager.getAsset('audio', pageData.audio),
        this.assetManager.getAsset('img', pageData.image)
      );
    }

    if (bookData.UI) {
      for (const [key, uiData] of Object.entries(bookData.UI)) {
        /* Ignore GAMES key, its not a page - HAACK */
        if (key === 'GAMES') {
          continue;
        }
        const lckey = rewritePageName(key.replace(/^PAGE_/, '').toLowerCase());

        this.pages[lckey] = this.pageProcessor({
          parentStyle: this.bookStyles,
          language: this.language,
          page: uiData as RawBookScreen,
          pageName: ucFirst(lckey),
        });
        const pageData = this.pages[lckey];
        pageData.id = lckey;
        pageData.image = `pages/pg${ucFirst(lckey)}.png`;
        this.promises.push(this.assetManager.getAsset('img', pageData.image));
      }

      if (bookData.UI.GAMES) {
        for (const gameKey of enumKeys(RawBookGames)) {
          const gameName = RawBookGames[gameKey];
          const gamePageData = bookData.UI.GAMES[gameName];
          if (!gamePageData) {
            continue;
          }

          const gameDifficultyKey = `gameDifficulty${gameName}`;
          this.pages[gameDifficultyKey] = this.pageProcessor({
            parentStyle: this.bookStyles,
            language: this.language,
            page: gamePageData,
            pageName: 'GameDifficulty',
            nextPageRewriter: (name) => {
              return `game${gameName}${ucFirst(name)}`;
            },
          });
          const gameDifficultyPageData = this.pages[gameDifficultyKey];
          gameDifficultyPageData.image = `pages/pgGameDifficulty_${gameName}.png`;
          this.promises.push(
            this.assetManager.getAsset('img', gameDifficultyPageData.image)
          );
          gameDifficultyPageData.back = 'game';

          this.pages[`game${gameName}Tutorial`] = this.pageProcessor({
            parentStyle: this.bookStyles,
            language: this.language,
            page: { LINES: [], HOTSPOTS: {} },
            pageName: `game${gameName}Tutorial`,
          });
          const gameTutorialPageData = this.pages[`game${gameName}Tutorial`];
          gameTutorialPageData.image = `pages/tutorial_${gameName}_${this.language}.png`;
          gameTutorialPageData.back = `gameDifficulty${gameName}`;
          this.promises.push(
            this.assetManager.getAsset('img', gameTutorialPageData.image)
          );

          for (const difficulty of enumKeys(RawBookDifficulties)) {
            const gameDifficultyData =
              gamePageData[RawBookDifficulties[difficulty]];
            if (!gameDifficultyData) {
              continue;
            }
            const gameKey = `game${gameName}${ucFirst(difficulty)}`;
            this.games[gameKey] = this.pageProcessor<BookGame>({
              parentStyle: this.bookStyles,
              language: this.language,
              page: gamePageData[RawBookDifficulties[difficulty]],
              pageName: gameKey,
            });
            const difficultyPageData = this.games[gameKey];
            difficultyPageData.image = `pages/pgGame${gameName}_${difficulty}.png`;
            this.promises.push(
              this.assetManager.getAsset('img', difficultyPageData.image)
            );
            difficultyPageData.gameName = gameName;
            difficultyPageData.back = `gameDifficulty${gameName}`;
            difficultyPageData.gameBoardParts = gameBoardParts;
            difficultyPageData.gameAnimations = gameAnimations;
            difficultyPageData.gameAssets = {};
            for (const value of Object.keys(gameAssets)) {
              difficultyPageData.gameAssets[value] = gameAssets[value];
            }

            difficultyPageData.boxes = {
              matchLocs: [],
            };
            for (const boxName of [
              'tries',
              'match',
              'reactionBox',
              'displayBox',
            ] as Array<keyof RawBookGameDetails>) {
              const gameBoxData = gameDifficultyData[boxName] as Array<number>;
              if (!gameBoxData) {
                continue;
              }
              difficultyPageData.boxes[
                boxName as keyof Omit<BookGameBoxes, 'matchLocs'>
              ] = {
                top: gameBoxData[0] * Constants.Dimensions.HEIGHT,
                left: gameBoxData[1] * Constants.Dimensions.WIDTH,
                height: gameBoxData[2] * Constants.Dimensions.HEIGHT,
                width: gameBoxData[3] * Constants.Dimensions.WIDTH,
              };
            }
            if (gameDifficultyData.matchLocs) {
              difficultyPageData.boxes.matchLocs = [];
              for (const gameBoxData of gameDifficultyData.matchLocs) {
                difficultyPageData.boxes.matchLocs.push({
                  top: gameBoxData[0] * Constants.Dimensions.HEIGHT,
                  left: gameBoxData[1] * Constants.Dimensions.WIDTH,
                  height: gameBoxData[2] * Constants.Dimensions.HEIGHT,
                  width: gameBoxData[3] * Constants.Dimensions.WIDTH,
                });
              }
            }
          }
        }
      }
    }
  }
  hasGame(page: string) {
    return page in this.games;
  }

  hasPage(page: string) {
    return page in this.games || page in this.pages;
  }

  pageProcessor<T extends BookPage = BookPage>({
    parentStyle,
    language,
    page,
    pageName,
    nextPageRewriter,
  }: {
    parentStyle: BookStyles;
    language: LanguageCode;
    page: RawBookScreen | RawBookPage | RawBookGame | RawBookGameDetails;
    pageName: string;
    nextPageRewriter?(p: string): string;
  }): T {
    // HOTSPOTS
    const pageData: BookPage = {
      id: pageName,
      image: '',
      audio: '',
      lines: [],
      images: [],
      hotspot: {
        mask: '',
        hotspots: {},
      },
      back: 'home',
      styles: Object.assign({}, parentStyle),
    };

    if ('STYLES' in page && page.STYLES) {
      Object.assign(pageData.styles, this.processStyleData(page.STYLES));
    }

    if (page.IMAGE) {
      for (const image of page.IMAGE) {
        this.promises.push(
          this.assetManager.getAsset(
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
    if ('BUTTONS' in page && page.BUTTONS) {
      for (const buttonName of Object.keys(page.BUTTONS)) {
        const image = page.BUTTONS[buttonName];
        let nextPageName = rewritePageName(buttonName);
        if (nextPageRewriter) {
          nextPageName = nextPageRewriter(nextPageName);
        }

        this.promises.push(
          this.assetManager.getAsset(
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
    if ('LINES' in page && page.LINES && page.LINES.length > 0) {
      for (const line of page.LINES) {
        const lineStyle = Object.assign(
          {},
          pageData.styles,
          this.processStyleData(line.STYLES)
        );
        const lineData: BookLine = {
          top: line.POS[0] * 100,
          left: line.POS[1] * 100,
          words: [],
        };
        pageData.lines.push(lineData);
        for (const word of line.WORDS) {
          const wordStyle = Object.assign({}, lineStyle);
          this.promises.push(
            this.assetManager.getAsset(
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
    if (
      'HOTSPOTS' in page &&
      page.HOTSPOTS &&
      Object.keys(page.HOTSPOTS).length > 0
    ) {
      pageData.hotspot = { mask: '', hotspots: {} };
      const hotspotData = pageData.hotspot;
      this.promises.push(
        this.assetManager
          .getAsset('img', `pages/pg${pageName}.hotspots.gif`)
          .then((asset) => {
            hotspotData.mask = asset.src;
            return asset;
          })
      );
      for (const [color, hotspots] of Object.entries(page.HOTSPOTS)) {
        for (const hotspot of hotspots) {
          const filename = `voice/${language.toUpperCase()}/spliced/${audioFilename(hotspot[1])}.mp3`;
          this.promises.push(
            this.assetManager.getAsset('audio', filename).then((asset) => {
              if (!hotspotData.hotspots[color]) {
                hotspotData.hotspots[color] = [];
              }
              hotspotData.hotspots[color].push({
                text: hotspot[0],
                audio: asset.src,
              });
              return asset;
            })
          );
        }
      }
    }
    return pageData as T;
  }

  processStyleData(styleData?: RawBookStyles): BookStyles {
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
          fontPath: this.assetManager.getBaseUrl() + font,
          fontFamily: font,
          fontSize: stateStyleData.SIZE,
        };
      }
    }
    return style;
  }
}
