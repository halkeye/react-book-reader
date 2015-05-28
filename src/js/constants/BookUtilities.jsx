var assign = require('object-assign');
var diacritics = require('diacritics');
const AssetManager = require('../AssetManager.js');
require('whatwg-fetch'); // polyfill
const Howl = require('howler').Howl;

const Constants = require('../constants/AppConstants.js');

let getAnimFile = (assetBaseUrl, animName) => {
  return new Promise((resolve, reject) => {
    fetch(assetBaseUrl + 'animations/' + animName + '/anim.txt')
      .then(response => response.text())
      .then((text) => {
        var array = [];
        text.replace("\r", "\n").replace(/\n+/, "\n").split("\n").forEach((line) => {
          if (!line) { return; }
          let [frameNo, timing] = line.split(",");
          array.push({
            filename: "animations/" + animName + "/" + animName + frameNo + ".png",
            nextTiming: parseInt(timing, 10)
          });
        });

        resolve(array);
      });
  });
};

let rewritePageName = (pageName) => {
  pageName += '';
  return pageName.replace(/^WP$/, 'gameDifficultyWP')
        .replace(/^PP$/, 'gameDifficultyPP')
        .replace(/^fullMonty$/, 'gameDifficultyfullMonty')
        .replace('readToMe', 'readAudio')
        .replace('readAgain', 'read')
        .replace(/^games$/, 'game')
  ;
};

let audioFilename = (filename) => {
  filename += '';
  return diacritics.remove(filename).toLowerCase().replace(/[^\w ]/g, "").replace(/\s+$/g, "");
};

let dirname = (path) => {
  //  discuss at: http://phpjs.org/functions/dirname/
  // original by: Ozh
  // improved by: XoraX (http://www.xorax.info)
  //   example 1: dirname('/etc/passwd');
  //   returns 1: '/etc'
  //   example 2: dirname('c:/Temp/x');
  //   returns 2: 'c:/Temp'
  //   example 3: dirname('/dir/test/');
  //   returns 3: '/dir'

  if (!path) { return path; }
  return path.replace(/\\/g, '/')
    .replace(/\/[^\/]*\/?$/, '');
};

let ucFirst = (str) => {
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1).toLowerCase();
};

let pad_func = (value, width, pad) => {
  pad = pad || '0';
  value = value + '';
  return value.length >= width ? value : new Array(width - value.length + 1).join(pad) + value;
};

let colorToInt = (color) => {
  return (color.a << 24) | (color.r << 16) | (color.g << 8) | (color.b << 0);
};

let intToRGBA = (colorInt) => {
  var alpha = ((colorInt >> 24) & 255) / 255;
  var red = (colorInt >> 16) & 255;
  var green = (colorInt >> 8) & 255;
  var blue = (colorInt >> 0) & 255;

  return 'rgba(' + [red, green, blue].join(',') + ', ' + alpha + ')';
};

let processStyleData = (assetBaseUrl, styleData) => {
  var style = {};
  if (!styleData) { return {}; }

  ['read', 'reading', 'unread'].forEach(function(state) {
    var font = styleData[state.toUpperCase()].FONT;
    style[state] = {
      color: intToRGBA(styleData[state.toUpperCase()].COLOR),
      fontPath: assetBaseUrl + font,
      fontFamily: font,
      fontSize: styleData[state.toUpperCase()].SIZE
    };
  });
  return style;
};

let pageProcessor = (options) => {
  let {promises, asset_manager, parentStyle, language, page, pageName, nextPageRewriter} = options;

  // HOTSPOTS
  var pageData = {};
  pageData.id = pageName;
  pageData.asset_manager = asset_manager;

  pageData.styles = assign(
    {},
    parentStyle,
    processStyleData(asset_manager.getBaseUrl(), page.STYLES)
  );
  pageData.lines = [];
  pageData.images = [];

  if (page.IMAGE)
  {
    page.IMAGE.forEach((image) => {
      promises.push(asset_manager.queueDownload('img', 'images/' + image.FILENAME.replace('[lang]', language) + '.png'));
      pageData.images.push({
        image: 'images/' + image.FILENAME.replace('[lang]', language) + '.png',
        top: (image.POS[0] * 100),
        left: (image.POS[1] * 100),
        height: (image.POS[2] * 100),
        width: (image.POS[3] * 100)
      });
    });
  }
  if (page.BUTTONS)
  {
    Object.keys(page.BUTTONS).forEach((buttonName) => {
      let image = page.BUTTONS[buttonName];
      let nextPageName = rewritePageName(buttonName);
      if (nextPageRewriter) { nextPageName = nextPageRewriter(nextPageName); }

      promises.push(asset_manager.queueDownload('img', 'buttons/pg' + pageName + '_' + buttonName + '.png'));
      pageData.images.push({
        nextPage: nextPageName,
        image: 'buttons/pg' + pageName + '_' + buttonName + '.png',
        top: (image.POS[0] * 100),
        left: (image.POS[1] * 100),
        height: (image.POS[2] * 100),
        width: (image.POS[3] * 100)
      });
    });
  }
  if (page.LINES)
  {
    page.LINES.forEach(function(line) {
      var lineStyle = assign({}, pageData.styles, processStyleData(asset_manager.getBaseUrl(), line.STYLES));
      var lineData = {
        top: (line.POS[0] * 100),
        left: (line.POS[1] * 100),
        words: []
      };
      pageData.lines.push(lineData);
      line.WORDS.forEach(function(word) {
        var wordStyle = assign({}, lineStyle, processStyleData(asset_manager.getBaseUrl(), word.STYLES));
        promises.push(asset_manager.queueDownload('audio', 'voice/' + language.toUpperCase() + '/spliced/' + audioFilename(word[0]) + '.mp3'));
        var wordData = {
          word: word[0],
          start: word[1],
          end: word[2],
          styles: wordStyle,
          audio: 'voice/' + language.toUpperCase() + '/spliced/' + audioFilename(word[0]) + '.mp3'
        };
        lineData.words.push(wordData);
      });
    });
  }
  if (page.HOTSPOTS)
  {
    promises.push(asset_manager.queueDownload('img', "pages/pg" + pad_func(pageName, 2) + ".hotspots.gif"));
    pageData.hotspot = {
      image: "pages/pg" + pad_func(pageName, 2) + ".hotspots.gif",
      hotspots: {}
    };
    Object.keys(page.HOTSPOTS).forEach(function(color) {
      pageData.hotspot.hotspots[color] = [];
      page.HOTSPOTS[color].forEach(function(hotspot) {
        promises.push(asset_manager.queueDownload('audio', 'voice/' + language.toUpperCase() + '/spliced/' + audioFilename(hotspot[1]) + '.mp3'));
        pageData.hotspot.hotspots[color].push({
          text: hotspot[0],
          audio: 'voice/' + language.toUpperCase() + '/spliced/' + audioFilename(hotspot[1]) + '.mp3'
        });
      });
    });
  }
  return pageData;
};

class AssetManagerAudioType {
  constructor() {
    this.events = {};
  }
  set src(val) {
    let urls = [val, val.replace(/.mp3$/, '.ogg')];
    this.urls = urls;
    setTimeout( () => {
      this.audio = new Howl({
        urls: urls,
        onload: () => {
          if (this.events.load) { this.events.load(); }
          delete this.events;
        },
        onloaderror: () => {
          if (this.events.error) { this.events.error(); }
          delete this.events;
        }
      });
    }, 1);
  }
  addEventListener(evname, func) {
    this.events[evname] = func;
  }
}

let processBookData = (settings, assetBaseUrl, bookData, language) => {
  var promises = [];

  var book = {
    asset_manager: new AssetManager(assetBaseUrl),
    language: language,
    pages: {},
    games: {}
  };
  book.asset_manager.addType('audio', AssetManagerAudioType);
  promises.push(book);

  promises.push(book.asset_manager.queueDownload('img', 'pages/gameEnd.png'));

  promises.push(book.asset_manager.queueDownload('img', `game/gameEnd_title_${language}.png`, 'game/gameEnd_title.png'));
  promises.push(book.asset_manager.queueDownload('img', `buttons/gameEnd_playAgain-${language}.png`, 'buttons/gameEnd_playAgain.png'));
  promises.push(book.asset_manager.queueDownload('img', `buttons/gameEnd_changeDiff-${language}.png`, 'buttons/gameEnd_changeDiff.png'));
  promises.push(book.asset_manager.queueDownload('img', `buttons/gameEnd_backGameMenu-${language}.png`, 'buttons/gameEnd_backGameMenu.png'));

  promises.push(book.asset_manager.queueDownload('img', 'buttons/control_back.png'));
  promises.push(book.asset_manager.queueDownload('img', 'buttons/control_home.png'));
  promises.push(book.asset_manager.queueDownload('img', 'buttons/control_pause.png'));
  promises.push(book.asset_manager.queueDownload('img', 'buttons/control_play.png'));
  promises.push(book.asset_manager.queueDownload('img', 'buttons/control_settings.png'));

  book.bookStyles = processStyleData(book.asset_manager.getBaseUrl(), bookData.STYLES);
  var gameAnimations = {};
  ['bad', 'good', 'neutral', 'pointing'].forEach((animName) => {
    getAnimFile(book.asset_manager.getBaseUrl(), animName).then((frames) => {
      frames.forEach((frame) => {
        promises.push(book.asset_manager.queueDownload('img', frame.filename));
        frame.frame = book.asset_manager.getAsset.bind(book.asset_manager, frame.filename);
      });
      gameAnimations[animName] = frames;
    });
  });
  var gameBoardParts = {};
  gameBoardParts = [
    "apples", "bread", "cereal", "cheese", "cherries", "cupcake", "ham", "hotdog",
    "milk", "mushrooms", "olives", "pbNj", "pears", "pie", "rice", "sardine", "soup",
    "sundae", "tomatoes", "waffles"
  ].map((piece) => {

    promises.push(book.asset_manager.queueDownload('img', `game_board_assets/game_board_image_${piece}.png`));
    let imageObj = function() { return book.asset_manager.getAsset(`game_board_assets/game_board_image_${piece}.png`); };

    promises.push(book.asset_manager.queueDownload('img', `game_board_assets/game_board_text_${piece}-${language}.png`));
    let textImageObj = function() { return book.asset_manager.getAsset(`game_board_assets/game_board_text_${piece}-${language}.png`); };

    return {
      'key': piece,
      'image': imageObj,
      'text': textImageObj
    };
  });

  var gameAssets = {};
  [
    'game_cupbard_door_closed',
    'game_cupbard_door_open'
  ].forEach((file) => {
    let filename = "game/" + file + ".png";
    promises.push(book.asset_manager.queueDownload('img', filename));
    gameAssets[file] = function() { return book.asset_manager.getAsset(filename); };
  });
  /* FIXME - move game anims to here so we can do promises with them */

  book.pages = [];
  book.games = [];
  bookData.PAGES[language].forEach((page, idx) => {
    let pageData = book.pages[idx+1] = pageProcessor({
      promises: promises,
      asset_manager: book.asset_manager,
      parentStyle: book.bookStyles,
      language: language,
      page: page,
      pageName: idx+1
    });
    pageData.pageImage = "pages/pg" + pad_func(idx + 1, 2) + ".png";
    pageData.pageAudio = 'voice/' + language.toUpperCase() + '/page' + pad_func(idx+1, 2) + '.mp3';
    promises.push(book.asset_manager.queueDownload('audio', pageData.pageAudio));
    promises.push(book.asset_manager.queueDownload('img', pageData.pageImage));
  });
  if (bookData.UI) {
    Object.keys(bookData.UI).forEach((key) => {
      /* Ignore GAMES key, its not a page - HAACK */
      if (key === 'GAMES') { return; }
      let lckey = rewritePageName(key.replace(/^PAGE_/, '').toLowerCase());

      let pageData = book.pages[lckey] = pageProcessor({
        promises: promises,
        asset_manager: book.asset_manager,
        parentStyle: book.bookStyles,
        language: language,
        page: bookData.UI[key],
        pageName: ucFirst(lckey)
      });
      pageData.id = lckey;
      pageData.pageImage = "pages/pg" + ucFirst(lckey) + ".png";
      book.asset_manager.queueDownload('img', pageData.pageImage);
    });
    if (bookData.UI.GAMES) {
      Object.keys(bookData.UI.GAMES).forEach((gameName) => {
        let gameDifficultyKey = `gameDifficulty${gameName}`;
        let gameDifficultyPageData = book.pages[gameDifficultyKey] = pageProcessor({
          promises: promises,
          asset_manager: book.asset_manager,
          parentStyle: book.bookStyles,
          language: language,
          page: bookData.UI.GAMES[gameName],
          pageName: 'GameDifficulty',
          nextPageRewriter: (name) => {
            return `game${gameName}${ucFirst(name)}`;
          }
        });
        gameDifficultyPageData.pageImage = `pages/pgGameDifficulty_${gameName}.png`;
        promises.push(book.asset_manager.queueDownload('img', gameDifficultyPageData.pageImage));
        gameDifficultyPageData.back = 'game';

        let gameTutorialPageData = book.pages[`game${gameName}Tutorial`] = pageProcessor({
          promises: promises,
          asset_manager: book.asset_manager, parentStyle: book.bookStyles,
          language: language, page: {}, pageName: `game${gameName}Tutorial`
        });
        gameTutorialPageData.pageImage = `pages/tutorial_${gameName}_${language}.png`;
        gameTutorialPageData.back = `gameDifficulty${gameName}`;
        promises.push(book.asset_manager.queueDownload('img', gameTutorialPageData.pageImage));

        ['easy', 'medium', 'hard'].forEach((difficulty) => {
          let gameKey = `game${gameName}${ucFirst(difficulty)}`;
          let difficultyPageData = book.games[gameKey] = pageProcessor({
            promises: promises,
            asset_manager: book.asset_manager,
            parentStyle: book.bookStyles,
            language: language,
            page: bookData.UI.GAMES[gameName][difficulty],
            pageName: gameKey
          });
          difficultyPageData.pageImage = `pages/pgGame${gameName}_${difficulty}.png`;
          promises.push(book.asset_manager.queueDownload('img', difficultyPageData.pageImage));
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
            if (!bookData.UI.GAMES[gameName][difficulty][boxName]) { return; }
            let boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
            /* FIXME */
            difficultyPageData.boxes[boxName] = {
              top: (boxData[0] * Constants.Dimensions.HEIGHT),
              left: (boxData[1] * Constants.Dimensions.WIDTH),
              height: (boxData[2] * Constants.Dimensions.HEIGHT),
              width: (boxData[3] * Constants.Dimensions.WIDTH)
            };
          });
          ['matchLocs'].forEach((boxName) => {
            if (!bookData.UI.GAMES[gameName][difficulty][boxName]) { return; }
            let boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
            /* FIXME */
            difficultyPageData.boxes[boxName] = boxData.map((data) => {
              return {
                top: (data[0] * Constants.Dimensions.HEIGHT),
                left: (data[1] * Constants.Dimensions.WIDTH),
                height: (data[2] * Constants.Dimensions.HEIGHT),
                width: (data[3] * Constants.Dimensions.WIDTH)
              };
            });
          });
        });
      });
    }
  }
  book.hasGame = function(page) {
    return typeof book.games[page] !== 'undefined';
  };
  book.hasPage = function(page) {
    return typeof book.pages[page] !== 'undefined' || typeof book.games[page] !== 'undefined';
  };
  return Promise.all(promises);
};

module.exports = {
  dirname: dirname,
  pad: pad_func,
  colorToInt: colorToInt,
  intToRGBA: intToRGBA,
  processBookData: processBookData
};
