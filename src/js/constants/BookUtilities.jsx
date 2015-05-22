var assign = require('object-assign');
var diacritics = require('diacritics');

const Constants = require('../constants/AppConstants.js');

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
  return diacritics.remove(filename).toLowerCase().replace(/[^\w ]/g, "");
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
      fontPath: assetBaseUrl + '/' + font,
      fontFamily: font,
      //size: (bookData.STYLES[state.toUpperCase()].SIZE/1024) + 'vw'//*settings.widthOffset,
      fontSize: styleData[state.toUpperCase()].SIZE
    };
  });
  return style;
};

let pageProcessor = (options) => {
  let {assetBaseUrl, parentStyle, language, page, pageName, nextPageRewriter} = options;

  // HOTSPOTS
  var pageData = {};
  pageData.assetBaseUrl = assetBaseUrl;
  pageData.id = pageName;
  if (!isNaN(pageName)) // if is number
  {
    pageData.pageImage = assetBaseUrl + "/pages/pg" + pad_func(pageName, 2) + ".png";
    pageData.pageAudio = assetBaseUrl + '/voice/' + language.toUpperCase() + '/page' + pad_func(pageName, 2) + '.mp3';
  }
  else
  {
    pageData.pageImage = assetBaseUrl + "/pages/pg" + pageName + ".png";
  }

  pageData.styles = assign(
    {},
    parentStyle,
    processStyleData(assetBaseUrl, page.STYLES)
  );
  pageData.lines = [];
  pageData.images = [];

  if (page.IMAGE)
  {
    page.IMAGE.forEach((image) => {
      pageData.images.push({
        image: assetBaseUrl + '/images/' + image.FILENAME.replace('[lang]', language) + '.png',
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
      pageData.images.push({
        nextPage: nextPageName,
        image: assetBaseUrl + '/buttons/pg' + pageName + '_' + buttonName + '.png',
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
      var lineStyle = assign({}, pageData.styles, processStyleData(assetBaseUrl, line.STYLES));
      var lineData = {
        top: (line.POS[0] * 100),
        left: (line.POS[1] * 100),
        words: []
      };
      pageData.lines.push(lineData);
      line.WORDS.forEach(function(word) {
        var wordStyle = assign({}, lineStyle, processStyleData(assetBaseUrl, word.STYLES));
        var wordData = {
          word: word[0],
          start: word[1],
          end: word[2],
          styles: wordStyle,
          audio: assetBaseUrl + '/voice/' + language.toUpperCase() + '/spliced/' + audioFilename(word[0]) + '.mp3'
        };
        lineData.words.push(wordData);
      });
    });
  }
  if (page.HOTSPOTS)
  {
    pageData.hotspot = {
      image: assetBaseUrl + "/pages/pg" + pad_func(pageName, 2) + ".hotspots.gif",
      hotspots: {}
    };
    Object.keys(page.HOTSPOTS).forEach(function(color) {
      pageData.hotspot.hotspots[color] = [];
      page.HOTSPOTS[color].forEach(function(hotspot) {
        pageData.hotspot.hotspots[color].push({
          text: hotspot[0],
          audio: assetBaseUrl + '/voice/' + language.toUpperCase() + '/spliced/' + audioFilename(hotspot[1]) + '.mp3'
        });
      });
    });
  }
  return pageData;
};

let processBookData = (settings, assetBaseUrl, bookData) => {
  var book = {
    pages: {},
    games: {}
  };
  book.languages = Object.keys(bookData.PAGES);
  book.bookStyles = processStyleData(assetBaseUrl, bookData.STYLES);

  book.languages.forEach(function(language) {
    book.pages[language] = [];
    book.games[language] = [];
    bookData.PAGES[language].forEach((page, idx) => {
      book.pages[language][idx+1] = pageProcessor({
        assetBaseUrl: assetBaseUrl,
        parentStyle: book.bookStyles,
        language: language,
        page: page,
        pageName: idx+1
        });
    });
    if (bookData.UI) {
      Object.keys(bookData.UI).forEach((key) => {
        /* Ignore GAMES key, its not a page - HAACK */
        if (key === 'GAMES') { return; }
        let lckey = rewritePageName(key.replace(/^PAGE_/, '').toLowerCase());

        book.pages[language][lckey] = pageProcessor({
          assetBaseUrl: assetBaseUrl,
          parentStyle: book.bookStyles,
          language: language,
          page: bookData.UI[key],
          pageName: ucFirst(lckey)
        });
        book.pages[language][lckey].id = lckey;
      });
      if (bookData.UI.GAMES) {
        Object.keys(bookData.UI.GAMES).forEach((gameName) => {
          let gameDifficultyKey = `gameDifficulty${gameName}`;
          book.pages[language][gameDifficultyKey] = pageProcessor({
            assetBaseUrl: assetBaseUrl,
            parentStyle: book.bookStyles,
            language: language,
            page: bookData.UI.GAMES[gameName],
            pageName: 'GameDifficulty',
            nextPageRewriter: (name) => {
              return `game${gameName}${ucFirst(name)}`;
            }
          });
          book.pages[language][gameDifficultyKey].pageImage = `${assetBaseUrl}/pages/pgGameDifficulty_${gameName}.png`;
          book.pages[language][gameDifficultyKey].back = 'game';


          book.pages[language][`game${gameName}Tutorial`] = pageProcessor({
            assetBaseUrl: assetBaseUrl, parentStyle: book.bookStyles,
            language: language, page: {}, pageName: ''
          });
          assign(
            book.pages[language][`game${gameName}Tutorial`],
            {
              pageImage: `${assetBaseUrl}/pages/tutorial_${gameName}_${language}.png`,
              back: `gameDifficulty${gameName}`
            }
          );

          ['easy', 'medium', 'hard'].forEach((difficulty) => {
            let gameKey = `game${gameName}${ucFirst(difficulty)}`;
            book.games[language][gameKey] = pageProcessor({
              assetBaseUrl: assetBaseUrl,
              parentStyle: book.bookStyles,
              language: language,
              page: bookData.UI.GAMES[gameName][difficulty],
              pageName: gameKey
            });
            book.games[language][gameKey].pageImage = `${assetBaseUrl}/pages/pgGame${gameName}_${difficulty}.png`;
            book.games[language][gameKey].back = `gameDifficulty${gameName}`;
            book.games[language][gameKey].boxes = {};
            ['tries', 'match', 'reactionBox'].forEach((boxName) => {
              if (!bookData.UI.GAMES[gameName][difficulty][boxName]) { return; }
              let boxData = bookData.UI.GAMES[gameName][difficulty][boxName];
              /* FIXME */
              book.games[language][gameKey].boxes[boxName] = {
                top: (boxData[0] * Constants.Dimensions.HEIGHT),
                left: (boxData[1] * Constants.Dimensions.WIDTH),
                height: (boxData[2] * Constants.Dimensions.HEIGHT),
                width: (boxData[3] * Constants.Dimensions.WIDTH)
              };
            });

          });
          // ,bookData.UI.GAMES[key] easy, hard, medium
        });
      }
    }
  });
  book.hasGame = function(language, page) {
    return typeof book.games[language][page] !== 'undefined';
  };
  book.hasPage = function(language, page) {
    return typeof book.pages[language][page] !== 'undefined' || typeof book.games[language][page] !== 'undefined';
  };
  return book;
};

module.exports = {
  dirname: dirname,
  pad: pad_func,
  colorToInt: colorToInt,
  intToRGBA: intToRGBA,
  processBookData: processBookData
};
