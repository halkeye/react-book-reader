import { createContext } from 'react';

export type Fonts = {
  [fontFamily: string]: string /* filename */;
};

const fontTypes = [
  ['eot#iefix', 'embedded-opentype'],
  ['woff', 'woff'],
  ['ttf', 'truetype'],
  ['svg', 'svg'],
];

export const FontContext = createContext(useAddFont);

const fonts: Fonts = {};

export function useAddFont() {
  return (fontFamily: string, fontPath: string) => {
    if (!fonts[fontFamily]) {
      // FIXME - this should be done when parsing not rendering
      fonts[fontFamily] = fontPath;
    }
  };
}

export const useFonts = () => {
  const css = Object.entries(fonts)
    .map(
      (fontFamily, filename) => `@font-face {
      font-family: "${fontFamily}";
      src: url('${filename}.eot');
      src: ${fontTypes.map(([type, format]) => `url('${filename}.${type}') format('${format}')`).join(', ')};
    }`
    )
    .join('');

  const styleId = 'ReactHtmlReaderFonts';
  let style = document.querySelector<HTMLStyleElement>(`style.${styleId}`);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }

  style = document.createElement('style', {});
  style.id = styleId;
  style.appendChild(document.createTextNode(css));
  document.getElementsByTagName('head')[0].appendChild(style);
};
