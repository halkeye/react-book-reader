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

let pageProcessor = (assetBaseUrl, parentStyle, language, page, idx) => {
  // HOTSPOTS
  var pageData = {};
  if (idx > 0) {
    pageData.pageImage = assetBaseUrl + "/pages/pg" + pad(idx+1, 2) + ".png";
    pageData.hotspotImage = assetBaseUrl + "/pages/pg" + pad(idx+1, 2) + ".hotspots.gif";
  }
  else
  {
    pageData.pageImage = assetBaseUrl + "/pages/pg" + ucFirst(idx) + ".png";
  }

  pageData.pageStyle = parentStyle; // FIXME
  pageData.lines = [];
  pageData.hotspots = [];
  pageData.images = [];

  if (page.IMAGE)
  {
    pageData.images = page.IMAGE.map((image,idx) => {
      return {
        image: assetBaseUrl + '/images/' + image.FILENAME.replace('[lang]', language) + '.png',
        top: image.POS[0]*100,
        left: image.POS[1]*100,
        bottom: image.POS[2]*100,
        right: image.POS[3]*100
      };
    });
  }
  if (page.LINES)
  {
    page.LINES.forEach(function(line) {
      var lineData = {
        //top: line.POS[0]*settings.height*settings.heightOffset,
  //                  left: line.POS[1]*settings.width*settings.widthOffset,
        top: (line.POS[0]*100) + '%',
        left: (line.POS[1]*100) + '%',
        words: []
      };
      pageData.lines.push(lineData);
      line.WORDS.forEach(function(word) {
        var wordData = {
          word: word[0],
          start: word[1],
          end: word[2]
        };
        lineData.words.push(wordData);
      });
    });
  }
  if (page.HOTSPOTS)
  {
    Object.keys(page.HOTSPOTS).forEach(function(color) {
      pageData.hotspots[color] = [];
      page.HOTSPOTS[color].forEach(function(hotspot) {
        pageData.hotspots[color].push({ text: hotspot[0], filename: hotspot[1] });
      });
    });
  }
  return pageData;
};

let pad = (value, width, pad) => {
  pad = pad || '0';
  value = value + '';
  return value.length >= width ? value : new Array(width - value.length + 1).join(pad) + value;
};

let colorToInt = (color) => {
  return (color.a << 24) | (color.r << 16) | (color.g << 8) | (color.b << 0);
};

let intToRGBA = (colorInt) => {
  var alpha = ((colorInt >> 24) & 255)/255;
  var red = (colorInt >> 16) & 255;
  var green = (colorInt >> 8) & 255;
  var blue = (colorInt >> 0) & 255;

  return 'rgba(' + [red, green, blue].join(',') + ', ' + alpha + ')';
};

let processBookData = (settings, assetBaseUrl, bookData) => {
  var book = {};
  book.languages = Object.keys(bookData.PAGES);
    book.bookStyles = {};
    var fonts = {};
    ['read','reading','unread'].forEach(function(state) {
      var font = bookData.STYLES[state.toUpperCase()].FONT;
      book.bookStyles[state] = {
        color: intToRGBA(bookData.STYLES[state.toUpperCase()].COLOR),
        font: font,
        size: (bookData.STYLES[state.toUpperCase()].SIZE/1024) + 'vw'//*settings.widthOffset,
      };
      //console.log(bookData.STYLES[state.toUpperCase()].SIZE);
      //console.log(book.bookStyles[state].size);
      book.bookStyles[state].size = '7vh'
      fonts[font] = {
        url: assetBaseUrl + '/' + font + '.ttf',
        family: font
      };
    });
    book.fonts = Object.keys(fonts).map(function(val) { return fonts[val]; });
    book.pages = {};
    book.languages.forEach(function(language) {
      book.pages[language] = bookData.PAGES[language].map((page, idx) => {
        return pageProcessor(assetBaseUrl,book.bookStyles,language,page,idx);
      });
      if (bookData.UI) {
        Object.keys(bookData.UI).forEach((key) => {
          let lckey = key.replace(/^PAGE_/, '').toLowerCase();
          book.pages[language][lckey] = pageProcessor(
            assetBaseUrl,
            book.bookStyles,
            language,
            bookData.UI[key],
            lckey
          );
        });
      }
    });
    return book;
};

module.exports = {
  dirname: dirname,
  pad: pad,
  colorToInt: colorToInt,
  intToRGBA: intToRGBA,
  processBookData: processBookData,
};
