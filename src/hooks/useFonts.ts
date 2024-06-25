import { atom } from 'jotai';

export type Fonts = {
  [fontFamily: string]: string /* filename */;
};

const fontTypes = [
  ['eot#iefix', 'embedded-opentype'],
  ['woff', 'woff'],
  ['ttf', 'truetype'],
  ['svg', 'svg'],
];

export const fontsAtom = atom<Fonts>({});

export const useFonts = (fonts: Fonts) => {
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
