import Book from "../models/Book.js";

let assign = require("object-assign");
let diacritics = require("diacritics");
require("whatwg-fetch"); // polyfill
const { Howl } = require("howler");

const Constants = require("../constants/AppConstants.js");

function getAnimFile(assetBaseUrl, animName) {
  return new Promise((resolve, reject) => {
    fetch(assetBaseUrl + "animations/" + animName + "/anim.txt")
      .then(response => response.text())
      .then(text => {
        let array = [];
        text
          .replace("\r", "\n")
          .replace(/\n+/, "\n")
          .split("\n")
          .forEach(line => {
            if (!line) {
              return;
            }
            let [frameNo, timing] = line.split(",");
            array.push({
              filename:
                "animations/" + animName + "/" + animName + frameNo + ".png",
              nextTiming: parseInt(timing, 10)
            });
          });

        resolve(array);
      });
  });
}

let rewritePageName = pageName => {
  pageName += "";
  return pageName
    .replace(/^WP$/, "gameDifficultyWP")
    .replace(/^PP$/, "gameDifficultyPP")
    .replace(/^fullMonty$/, "gameDifficultyfullMonty")
    .replace("readToMe", "readAudio")
    .replace("readAgain", "read")
    .replace(/^games$/, "game");
};

function audioFilename(filename) {
  filename += "";
  return diacritics
    .remove(filename)
    .toLowerCase()
    .replace(/[^\w ]/g, "")
    .replace(/\s+$/g, "");
}

function dirname(path) {
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
  return path.replace(/\\/g, "/").replace(/\/[^/]*\/?$/, "");
}

function ucFirst(str) {
  str += "";
  let f = str.charAt(0).toUpperCase();
  return f + str.substr(1).toLowerCase();
}

function padFunc(value, width, pad) {
  pad = pad || "0";
  value = value + "";
  return value.length >= width
    ? value
    : new Array(width - value.length + 1).join(pad) + value;
}

function colorToInt(color) {
  return (color.a << 24) | (color.r << 16) | (color.g << 8) | (color.b << 0);
}

function intToRGBA(colorInt) {
  let alpha = ((colorInt >> 24) & 255) / 255;
  let red = (colorInt >> 16) & 255;
  let green = (colorInt >> 8) & 255;
  let blue = (colorInt >> 0) & 255;

  return "rgba(" + [red, green, blue].join(",") + ", " + alpha + ")";
}

function processStyleData(assetBaseUrl, styleData) {
  let style = {};
  if (!styleData) {
    return {};
  }

  ["read", "reading", "unread"].forEach(function(state) {
    let font = styleData[state.toUpperCase()].FONT;
    style[state] = {
      color: intToRGBA(styleData[state.toUpperCase()].COLOR),
      fontPath: assetBaseUrl + font,
      fontFamily: font,
      fontSize: styleData[state.toUpperCase()].SIZE
    };
  });
  return style;
}

function pageProcessor(options) {
  let {
    promises,
    assetManager,
    parentStyle,
    language,
    page,
    pageName,
    nextPageRewriter
  } = options;

  // HOTSPOTS
  let pageData = {};
  pageData.id = pageName;
  pageData.assetManager = assetManager;

  pageData.styles = assign(
    {},
    parentStyle,
    processStyleData(assetManager.getBaseUrl(), page.STYLES)
  );
  pageData.lines = [];
  pageData.images = [];

  if (page.IMAGE) {
    page.IMAGE.forEach(image => {
      promises.push(
        assetManager.queueDownload(
          "img",
          "images/" + image.FILENAME.replace("[lang]", language) + ".png"
        )
      );
      pageData.images.push({
        image: "images/" + image.FILENAME.replace("[lang]", language) + ".png",
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100
      });
    });
  }
  if (page.BUTTONS) {
    Object.keys(page.BUTTONS).forEach(buttonName => {
      let image = page.BUTTONS[buttonName];
      let nextPageName = rewritePageName(buttonName);
      if (nextPageRewriter) {
        nextPageName = nextPageRewriter(nextPageName);
      }

      promises.push(
        assetManager.queueDownload(
          "img",
          "buttons/pg" + pageName + "_" + buttonName + ".png"
        )
      );
      pageData.images.push({
        nextPage: nextPageName,
        image: "buttons/pg" + pageName + "_" + buttonName + ".png",
        top: image.POS[0] * 100,
        left: image.POS[1] * 100,
        height: image.POS[2] * 100,
        width: image.POS[3] * 100
      });
    });
  }
  if (page.LINES) {
    page.LINES.forEach(function(line) {
      let lineStyle = assign(
        {},
        pageData.styles,
        processStyleData(assetManager.getBaseUrl(), line.STYLES)
      );
      let lineData = {
        top: line.POS[0] * 100,
        left: line.POS[1] * 100,
        words: []
      };
      pageData.lines.push(lineData);
      line.WORDS.forEach(function(word) {
        let wordStyle = assign(
          {},
          lineStyle,
          processStyleData(assetManager.getBaseUrl(), word.STYLES)
        );
        promises.push(
          assetManager.queueDownload(
            "audio",
            "voice/" +
              language.toUpperCase() +
              "/spliced/" +
              audioFilename(word[0]) +
              ".mp3"
          )
        );
        let wordData = {
          word: word[0],
          start: word[1],
          end: word[2],
          styles: wordStyle,
          audio:
            "voice/" +
            language.toUpperCase() +
            "/spliced/" +
            audioFilename(word[0]) +
            ".mp3"
        };
        lineData.words.push(wordData);
      });
    });
  }
  if (page.HOTSPOTS) {
    promises.push(
      assetManager.queueDownload(
        "img",
        "pages/pg" + padFunc(pageName, 2) + ".hotspots.gif"
      )
    );
    pageData.hotspot = {
      image: "pages/pg" + padFunc(pageName, 2) + ".hotspots.gif",
      hotspots: {}
    };
    Object.keys(page.HOTSPOTS).forEach(function(color) {
      pageData.hotspot.hotspots[color] = [];
      page.HOTSPOTS[color].forEach(function(hotspot) {
        promises.push(
          assetManager.queueDownload(
            "audio",
            "voice/" +
              language.toUpperCase() +
              "/spliced/" +
              audioFilename(hotspot[1]) +
              ".mp3"
          )
        );
        pageData.hotspot.hotspots[color].push({
          text: hotspot[0],
          audio:
            "voice/" +
            language.toUpperCase() +
            "/spliced/" +
            audioFilename(hotspot[1]) +
            ".mp3"
        });
      });
    });
  }
  return pageData;
}

class AssetManagerAudioType {
  constructor() {
    this.events = {};
  }
  set src(val) {
    let urls = [val.replace(/.mp3$/, ".ogg"), val];
    this.urls = urls;
    setTimeout(() => {
      this.audio = new Howl({
        src: urls,
        onload: () => {
          if (this.events.load) {
            this.events.load();
          }
          // FIXME - this fails on multiple loads (is that a thing)
          delete this.events;
        },
        onloaderror: args => {
          if (this.events.error) {
            this.events.error();
          }
          // FIXME - this fails on multiple errors
          delete this.events;
        }
      });
    }, 1);
  }
  addEventListener(evname, func) {
    this.events[evname] = func;
  }
}

function processBookData(assetBaseUrl, bookData, language) {
  let promises = [];

  const book = new Book(assetBaseUrl, language);
  book.assetManager.addType("audio", AssetManagerAudioType);

  promises.push(book.assetManager.queueDownload("img", "pages/gameEnd.png"));

  promises.push(
    book.assetManager.queueDownload(
      "img",
      `game/gameEnd_title_${language}.png`,
      "game/gameEnd_title.png"
    )
  );
  promises.push(
    book.assetManager.queueDownload(
      "img",
      `buttons/gameEnd_playAgain-${language}.png`,
      "buttons/gameEnd_playAgain.png"
    )
  );
  promises.push(
    book.assetManager.queueDownload(
      "img",
      `buttons/gameEnd_changeDiff-${language}.png`,
      "buttons/gameEnd_changeDiff.png"
    )
  );
  promises.push(
    book.assetManager.queueDownload(
      "img",
      `buttons/gameEnd_backGameMenu-${language}.png`,
      "buttons/gameEnd_backGameMenu.png"
    )
  );

  promises.push(
    book.assetManager.queueDownload("img", "buttons/control_back.png")
  );
  promises.push(
    book.assetManager.queueDownload("img", "buttons/control_home.png")
  );
  promises.push(
    book.assetManager.queueDownload("img", "buttons/control_pause.png")
  );
  promises.push(
    book.assetManager.queueDownload("img", "buttons/control_play.png")
  );
  promises.push(
    book.assetManager.queueDownload("img", "buttons/control_settings.png")
  );

  promises.push(
    book.assetManager.queueDownload("audio", "game/game_cupbard_correct.mp3")
  );
  promises.push(
    book.assetManager.queueDownload("audio", "game/game_cupbard_incorrect.mp3")
  );
  promises.push(
    book.assetManager.queueDownload("audio", "game/game_cupbard_door_sound.mp3")
  );

  book.bookStyles = processStyleData(
    book.assetManager.getBaseUrl(),
    bookData.STYLES
  );
  let gameAnimations = {};
  ["bad", "good", "neutral", "pointing"].forEach(animName => {
    getAnimFile(book.assetManager.getBaseUrl(), animName).then(frames => {
      frames.forEach(frame => {
        promises.push(book.assetManager.queueDownload("img", frame.filename));
        frame.frame = book.assetManager.getAsset.bind(
          book.assetManager,
          frame.filename
        );
      });
      gameAnimations[animName] = frames;
    });
  });
  let gameBoardParts = {};
  gameBoardParts = [
    "apples",
    "bread",
    "cereal",
    "cheese",
    "cherries",
    "cupcake",
    "ham",
    "hotdog",
    "milk",
    "mushrooms",
    "olives",
    "pbNj",
    "pears",
    "pie",
    "rice",
    "sardine",
    "soup",
    "sundae",
    "tomatoes",
    "waffles"
  ].map(piece => {
    let data = {
      key: piece,
      image: `game_board_assets/game_board_image_${piece}.png`,
      text: `game_board_assets/game_board_text_${piece}-${language}.png`
    };
    promises.push(book.assetManager.queueDownload("img", data.image));
    promises.push(book.assetManager.queueDownload("img", data.text));

    return data;
  });

  let gameAssets = {};
  ["game_cupbard_door_closed", "game_cupbard_door_open"].forEach(file => {
    let filename = "game/" + file + ".png";
    promises.push(book.assetManager.queueDownload("img", filename));
    gameAssets[file] = filename;
  });
  /* FIXME - move game anims to here so we can do promises with them */

  bookData.PAGES[language].forEach((page, idx) => {
    let pageData = (book.pages[idx + 1] = pageProcessor({
      promises: promises,
      assetManager: book.assetManager,
      parentStyle: book.bookStyles,
      language: language,
      page: page,
      pageName: idx + 1
    }));
    pageData.pageImage = "pages/pg" + padFunc(idx + 1, 2) + ".png";
    pageData.pageAudio =
      "voice/" +
      language.toUpperCase() +
      "/page" +
      padFunc(idx + 1, 2) +
      ".mp3";
    promises.push(book.assetManager.queueDownload("audio", pageData.pageAudio));
    promises.push(book.assetManager.queueDownload("img", pageData.pageImage));
  });
  if (bookData.UI) {
    Object.keys(bookData.UI).forEach(key => {
      /* Ignore GAMES key, its not a page - HAACK */
      if (key === "GAMES") {
        return;
      }
      let lckey = rewritePageName(key.replace(/^PAGE_/, "").toLowerCase());

      let pageData = (book.pages[lckey] = pageProcessor({
        promises: promises,
        assetManager: book.assetManager,
        parentStyle: book.bookStyles,
        language: language,
        page: bookData.UI[key],
        pageName: ucFirst(lckey)
      }));
      pageData.id = lckey;
      pageData.pageImage = "pages/pg" + ucFirst(lckey) + ".png";
      book.assetManager.queueDownload("img", pageData.pageImage);
    });
    if (bookData.UI.GAMES) {
      Object.keys(bookData.UI.GAMES).forEach(gameName => {
        let gameDifficultyKey = `gameDifficulty${gameName}`;
        let gameDifficultyPageData = pageProcessor({
          promises: promises,
          assetManager: book.assetManager,
          parentStyle: book.bookStyles,
          language: language,
          page: bookData.UI.GAMES[gameName],
          pageName: "GameDifficulty",
          nextPageRewriter: name => {
            return `game${gameName}${ucFirst(name)}`;
          }
        });
        book.pages[gameDifficultyKey] = gameDifficultyPageData;
        gameDifficultyPageData.pageImage = `pages/pgGameDifficulty_${gameName}.png`;
        promises.push(
          book.assetManager.queueDownload(
            "img",
            gameDifficultyPageData.pageImage
          )
        );
        gameDifficultyPageData.back = "game";

        let gameTutorialPageData = pageProcessor({
          promises: promises,
          assetManager: book.assetManager,
          parentStyle: book.bookStyles,
          language: language,
          page: {},
          pageName: `game${gameName}Tutorial`
        });
        book.pages[`game${gameName}Tutorial`] = gameTutorialPageData;
        gameTutorialPageData.pageImage = `pages/tutorial_${gameName}_${language}.png`;
        gameTutorialPageData.back = `gameDifficulty${gameName}`;
        promises.push(
          book.assetManager.queueDownload("img", gameTutorialPageData.pageImage)
        );

        ["easy", "medium", "hard"].forEach(difficulty => {
          let gameKey = `game${gameName}${ucFirst(difficulty)}`;
          let difficultyPageData = (book.games[gameKey] = pageProcessor({
            promises: promises,
            assetManager: book.assetManager,
            parentStyle: book.bookStyles,
            language: language,
            page: bookData.UI.GAMES[gameName][difficulty],
            pageName: gameKey
          }));
          difficultyPageData.pageImage = `pages/pgGame${gameName}_${difficulty}.png`;
          promises.push(
            book.assetManager.queueDownload("img", difficultyPageData.pageImage)
          );
          difficultyPageData.gameName = gameName;
          difficultyPageData.back = `gameDifficulty${gameName}`;
          difficultyPageData.gameBoardParts = gameBoardParts;
          difficultyPageData.gameAnimations = gameAnimations;
          difficultyPageData.gameAssets = {};
          Object.keys(gameAssets).forEach(value => {
            difficultyPageData.gameAssets[value] = gameAssets[value];
          });

          difficultyPageData.boxes = {};
          ["tries", "match", "reactionBox", "displayBox"].forEach(boxName => {
            if (!bookData.UI.GAMES[gameName][difficulty][boxName]) {
              return;
            }
            let boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
            /* FIXME */
            difficultyPageData.boxes[boxName] = {
              top: boxData[0] * Constants.Dimensions.HEIGHT,
              left: boxData[1] * Constants.Dimensions.WIDTH,
              height: boxData[2] * Constants.Dimensions.HEIGHT,
              width: boxData[3] * Constants.Dimensions.WIDTH
            };
          });
          ["matchLocs"].forEach(boxName => {
            if (!bookData.UI.GAMES[gameName][difficulty][boxName]) {
              return;
            }
            let boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
            /* FIXME */
            difficultyPageData.boxes[boxName] = boxData.map(data => {
              return {
                top: data[0] * Constants.Dimensions.HEIGHT,
                left: data[1] * Constants.Dimensions.WIDTH,
                height: data[2] * Constants.Dimensions.HEIGHT,
                width: data[3] * Constants.Dimensions.WIDTH
              };
            });
          });
        });
      });
    }
  }
  book.addAssetPromises(promises);
  return Promise.resolve(book);
}

module.exports = {
  dirname: dirname,
  pad: padFunc,
  colorToInt: colorToInt,
  intToRGBA: intToRGBA,
  processBookData: processBookData
};
