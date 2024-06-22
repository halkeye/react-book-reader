import diacritics from 'diacritics';
import AssetManager, {
  AssetManagerEventMap,
  AssetManagerType,
  DownloadQueueItem,
} from '../AssetManager.js';
import { Howl } from 'howler';
import Constants from '../constants/AppConstants.js';
import { LanguageCode, RawBook } from '../atoms.js';

const getAnimFile = async (assetBaseUrl: string, animName: string) => {
  const text = await fetch(
    assetBaseUrl + 'animations/' + animName + '/anim.txt'
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
    arr.push({
      filename: 'animations/' + animName + '/' + animName + frameNo + '.png',
      nextTiming: parseInt(timing, 10),
    });
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
  return f + str.substr(1).toLowerCase();
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

  return 'rgba(' + [red, green, blue].join(',') + ', ' + alpha + ')';
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

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => !Number.isNaN(k)) as K[];
}

export const processStyleData = (
  assetBaseUrl: string,
  styleData: Record<StyleDataState, StyleData>
) => {
  const style: Record<string, Record<string, string | number>> = {};
  if (!styleData) {
    return {};
  }

  for (const state of enumKeys(StyleDataState)) {
    const font = styleData[state].FONT;
    style[state] = {
      color: intToRGBA(styleData[state].COLOR),
      fontPath: assetBaseUrl + font,
      fontFamily: font,
      fontSize: styleData[state].SIZE,
    };
  }
  return style;
};

const pageProcessor = (options) => {
  const {
    promises,
    asset_manager,
    parentStyle,
    language,
    page,
    pageName,
    nextPageRewriter,
  } = options;

  // HOTSPOTS
  const pageData = {};
  pageData.id = pageName;
  pageData.asset_manager = asset_manager;

  pageData.styles = Object.assign(
    {},
    parentStyle,
    processStyleData(asset_manager.getBaseUrl(), page.STYLES)
  );
  pageData.lines = [];
  pageData.images = [];

  if (page.IMAGE) {
    page.IMAGE.forEach((image) => {
      promises.push(
        asset_manager.queueDownload(
          'img',
          'images/' + image.FILENAME.replace('[lang]', language) + '.png'
        )
      );
      pageData.images.push({
        image: 'images/' + image.FILENAME.replace('[lang]', language) + '.png',
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100,
      });
    });
  }
  if (page.BUTTONS) {
    Object.keys(page.BUTTONS).forEach((buttonName) => {
      const image = page.BUTTONS[buttonName];
      let nextPageName = rewritePageName(buttonName);
      if (nextPageRewriter) {
        nextPageName = nextPageRewriter(nextPageName);
      }

      promises.push(
        asset_manager.queueDownload(
          'img',
          'buttons/pg' + pageName + '_' + buttonName + '.png'
        )
      );
      pageData.images.push({
        nextPage: nextPageName,
        image: 'buttons/pg' + pageName + '_' + buttonName + '.png',
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100,
      });
    });
  }
  if (page.LINES) {
    page.LINES.forEach(function (line) {
      const lineStyle = Object.assign(
        {},
        pageData.styles,
        processStyleData(asset_manager.getBaseUrl(), line.STYLES)
      );
      const lineData = {
        top: line.POS[0] * 100,
        left: line.POS[1] * 100,
        words: [],
      };
      pageData.lines.push(lineData);
      line.WORDS.forEach(function (word) {
        const wordStyle = Object.assign(
          {},
          lineStyle,
          processStyleData(asset_manager.getBaseUrl(), word.STYLES)
        );
        promises.push(
          asset_manager.queueDownload(
            'audio',
            'voice/' +
              language.toUpperCase() +
              '/spliced/' +
              audioFilename(word[0]) +
              '.mp3'
          )
        );
        const wordData = {
          word: word[0],
          start: word[1],
          end: word[2],
          styles: wordStyle,
          audio:
            'voice/' +
            language.toUpperCase() +
            '/spliced/' +
            audioFilename(word[0]) +
            '.mp3',
        };
        lineData.words.push(wordData);
      });
    });
  }
  if (page.HOTSPOTS) {
    promises.push(
      asset_manager.queueDownload(
        'img',
        'pages/pg' + pad_func(pageName, 2) + '.hotspots.gif'
      )
    );
    pageData.hotspot = {
      image: 'pages/pg' + pad_func(pageName, 2) + '.hotspots.gif',
      hotspots: {},
    };
    Object.keys(page.HOTSPOTS).forEach(function (color) {
      pageData.hotspot.hotspots[color] = [];
      page.HOTSPOTS[color].forEach(function (hotspot) {
        promises.push(
          asset_manager.queueDownload(
            'audio',
            'voice/' +
              language.toUpperCase() +
              '/spliced/' +
              audioFilename(hotspot[1]) +
              '.mp3'
          )
        );
        pageData.hotspot.hotspots[color].push({
          text: hotspot[0],
          audio:
            'voice/' +
            language.toUpperCase() +
            '/spliced/' +
            audioFilename(hotspot[1]) +
            '.mp3',
        });
      });
    });
  }
  return pageData;
};

export const processBookData = (
  settings,
  assetBaseUrl: string,
  bookData: RawBook,
  language: LanguageCode
) => {
  const promises: Array<Promise<DownloadQueueItem>> = [];

  const book = {
    asset_manager: new AssetManager(assetBaseUrl),
    language: language,
    pages: {},
    games: {},
  };

  promises.push(book.asset_manager.queueDownload('img', 'pages/gameEnd.png'));

  promises.push(
    book.asset_manager.queueDownload(
      'img',
      `game/gameEnd_title_${language}.png`,
      'game/gameEnd_title.png'
    )
  );
  promises.push(
    book.asset_manager.queueDownload(
      'img',
      `buttons/gameEnd_playAgain-${language}.png`,
      'buttons/gameEnd_playAgain.png'
    )
  );
  promises.push(
    book.asset_manager.queueDownload(
      'img',
      `buttons/gameEnd_changeDiff-${language}.png`,
      'buttons/gameEnd_changeDiff.png'
    )
  );
  promises.push(
    book.asset_manager.queueDownload(
      'img',
      `buttons/gameEnd_backGameMenu-${language}.png`,
      'buttons/gameEnd_backGameMenu.png'
    )
  );

  promises.push(
    book.asset_manager.queueDownload('img', 'buttons/control_back.png')
  );
  promises.push(
    book.asset_manager.queueDownload('img', 'buttons/control_home.png')
  );
  promises.push(
    book.asset_manager.queueDownload('img', 'buttons/control_pause.png')
  );
  promises.push(
    book.asset_manager.queueDownload('img', 'buttons/control_play.png')
  );
  promises.push(
    book.asset_manager.queueDownload('img', 'buttons/control_settings.png')
  );

  promises.push(
    book.asset_manager.queueDownload('audio', 'game/game_cupbard_correct.mp3')
  );
  promises.push(
    book.asset_manager.queueDownload('audio', 'game/game_cupbard_incorrect.mp3')
  );
  promises.push(
    book.asset_manager.queueDownload(
      'audio',
      'game/game_cupbard_door_sound.mp3'
    )
  );

  book.bookStyles = processStyleData(
    book.asset_manager.getBaseUrl(),
    bookData.STYLES
  );
  const gameAnimations = {};
  ['bad', 'good', 'neutral', 'pointing'].forEach((animName) => {
    getAnimFile(book.asset_manager.getBaseUrl(), animName).then((frames) => {
      frames.forEach((frame) => {
        promises.push(book.asset_manager.queueDownload('img', frame.filename));
        frame.frame = book.asset_manager.getAsset.bind(
          book.asset_manager,
          frame.filename
        );
      });
      gameAnimations[animName] = frames;
    });
  });
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
      text: `game_board_assets/game_board_text_${piece}-${language}.png`,
    };
    promises.push(book.asset_manager.queueDownload('img', data.image));
    promises.push(book.asset_manager.queueDownload('img', data.text));

    return data;
  });

  const gameAssets = {};
  ['game_cupbard_door_closed', 'game_cupbard_door_open'].forEach((file) => {
    const filename = 'game/' + file + '.png';
    promises.push(book.asset_manager.queueDownload('img', filename));
    gameAssets[file] = filename;
  });
  /* FIXME - move game anims to here so we can do promises with them */

  book.pages = [];
  book.games = [];
  bookData.PAGES[language].forEach((page, idx) => {
    const pageData = (book.pages[idx + 1] = pageProcessor({
      promises: promises,
      asset_manager: book.asset_manager,
      parentStyle: book.bookStyles,
      language: language,
      page: page,
      pageName: idx + 1,
    }));
    pageData.pageImage = 'pages/pg' + pad_func(idx + 1, 2) + '.png';
    pageData.pageAudio =
      'voice/' +
      language.toUpperCase() +
      '/page' +
      pad_func(idx + 1, 2) +
      '.mp3';
    promises.push(
      book.asset_manager.queueDownload('audio', pageData.pageAudio)
    );
    promises.push(book.asset_manager.queueDownload('img', pageData.pageImage));
  });
  if (bookData.UI) {
    Object.keys(bookData.UI).forEach((key) => {
      /* Ignore GAMES key, its not a page - HAACK */
      if (key === 'GAMES') {
        return;
      }
      const lckey = rewritePageName(key.replace(/^PAGE_/, '').toLowerCase());

      const pageData = (book.pages[lckey] = pageProcessor({
        promises: promises,
        asset_manager: book.asset_manager,
        parentStyle: book.bookStyles,
        language: language,
        page: bookData.UI[key],
        pageName: ucFirst(lckey),
      }));
      pageData.id = lckey;
      pageData.pageImage = 'pages/pg' + ucFirst(lckey) + '.png';
      book.asset_manager.queueDownload('img', pageData.pageImage);
    });
    if (bookData.UI.GAMES) {
      Object.keys(bookData.UI.GAMES).forEach((gameName) => {
        const gameDifficultyKey = `gameDifficulty${gameName}`;
        const gameDifficultyPageData = (book.pages[gameDifficultyKey] =
          pageProcessor({
            promises: promises,
            asset_manager: book.asset_manager,
            parentStyle: book.bookStyles,
            language: language,
            page: bookData.UI.GAMES[gameName],
            pageName: 'GameDifficulty',
            nextPageRewriter: (name) => {
              return `game${gameName}${ucFirst(name)}`;
            },
          }));
        gameDifficultyPageData.pageImage = `pages/pgGameDifficulty_${gameName}.png`;
        promises.push(
          book.asset_manager.queueDownload(
            'img',
            gameDifficultyPageData.pageImage
          )
        );
        gameDifficultyPageData.back = 'game';

        const gameTutorialPageData = (book.pages[`game${gameName}Tutorial`] =
          pageProcessor({
            promises: promises,
            asset_manager: book.asset_manager,
            parentStyle: book.bookStyles,
            language: language,
            page: {},
            pageName: `game${gameName}Tutorial`,
          }));
        gameTutorialPageData.pageImage = `pages/tutorial_${gameName}_${language}.png`;
        gameTutorialPageData.back = `gameDifficulty${gameName}`;
        promises.push(
          book.asset_manager.queueDownload(
            'img',
            gameTutorialPageData.pageImage
          )
        );

        ['easy', 'medium', 'hard'].forEach((difficulty) => {
          const gameKey = `game${gameName}${ucFirst(difficulty)}`;
          const difficultyPageData = (book.games[gameKey] = pageProcessor({
            promises: promises,
            asset_manager: book.asset_manager,
            parentStyle: book.bookStyles,
            language: language,
            page: bookData.UI.GAMES[gameName][difficulty],
            pageName: gameKey,
          }));
          difficultyPageData.pageImage = `pages/pgGame${gameName}_${difficulty}.png`;
          promises.push(
            book.asset_manager.queueDownload(
              'img',
              difficultyPageData.pageImage
            )
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
          ['tries', 'match', 'reactionBox', 'displayBox'].forEach((boxName) => {
            if (!bookData.UI.GAMES[gameName][difficulty][boxName]) {
              return;
            }
            const boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
            /* FIXME */
            difficultyPageData.boxes[boxName] = {
              top: boxData[0] * Constants.Dimensions.HEIGHT,
              left: boxData[1] * Constants.Dimensions.WIDTH,
              height: boxData[2] * Constants.Dimensions.HEIGHT,
              width: boxData[3] * Constants.Dimensions.WIDTH,
            };
          });
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
};
