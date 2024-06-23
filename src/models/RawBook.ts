import { BookListEntry, LanguageCode } from '../atoms';

export interface RawBook extends BookListEntry {
  PAGES: RawBookPages;
  UI: RawBookUI;
  STYLES: RawBookStyles;
}

export type RawBookPages = {
  [lang in LanguageCode]: Array<RawBookPage>;
};

export interface RawBookPage {
  LINES: RawBookLine[];
  HOTSPOTS: RawBookHotspots;
  STYLES?: RawBookStyles;
  // I think only PAGE_HOME, END, and PAGE_GAMES
  IMAGE?: Array<RawBookImage>;
  BUTTONS?: RawBookButtons;
}

export interface RawBookLine {
  WORDS: [string, number, number][];
  STYLES?: RawBookStyles;
  POS: number[];
}

export interface RawBookHotspots {
  [color: string]: [string, string][];
}

export interface RawBookGameDetails {
  tries: number[];
  match: number[];
  reactionBox: number[];
  matches: Array<number[]>;
  IMAGE: RawBookImage[];
}

export interface RawBookGame {
  easy: RawBookGameDetails;
  medium: RawBookGameDetails;
  hard: RawBookGameDetails;
  BUTTONS: RawBookButtons;
  IMAGE: RawBookImage;
}

export interface RawBookUI {
  PAGE_HOME: {
    BUTTONS: RawBookButtons;
    IMAGE: RawBookImage;
  };
  PAGE_GAMES: {
    BUTTONS: RawBookButtons;
    IMAGE: RawBookImage;
  };
  GAMES: {
    WP: RawBookGame;
    fullMonty: RawBookGame;
    PP: RawBookGame;
  };
  PAGE_END: {
    BUTTONS: RawBookButtons;
    IMAGE: RawBookImage;
  };
}

export interface PageHome {
  BUTTONS: RawBookButtons;
  IMAGE: RawBookImage[];
}

export interface RawBookImage {
  FILENAME: string;
  POS: number[];
}

export interface RawBookButtons {
  [key: string]: {
    POS: number[];
  };
}

export interface RawBookStyles {
  UNREAD?: RawBookStyle;
  READING?: RawBookStyle;
  READ?: RawBookStyle;
}

export interface RawBookStyle {
  COLOR: number;
  SIZE: number;
  FONT: string;
}
