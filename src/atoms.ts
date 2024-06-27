import { atom } from 'jotai';
import { atomWithLocation } from 'jotai-location';
import { RawBook } from './models/RawBook';

const BASE_URL = 'https://books.saltystories.ca/books/';

export enum LanguageCode {
  EN = 'en',
  FR = 'fr',
}

export interface BookListEntry {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly icon: string;
  readonly iconBig: string;
  readonly version: number;
}

export const bookListAtom = atom(async (/*get*/) => {
  const res = await fetch('https://books.saltystories.ca/books/index.json');
  const data = (await res.json()) as Array<BookListEntry>;

  return data.map((bookListEntry) => {
    return {
      ...bookListEntry,
      icon: new URL(bookListEntry.icon, BASE_URL).toString(),
      iconBig: new URL(bookListEntry.iconBig, BASE_URL).toString(),
      url: new URL(bookListEntry.url, BASE_URL).toString(),
    };
  });
});

const locationAtom = atomWithLocation();

function atomFromQueryString<T>(name: string, defaultValue?: T) {
  return atom(
    (get) => get(locationAtom).searchParams?.get(name) ?? defaultValue,
    (get, set, value: T) => {
      const newSearchParams = new URLSearchParams(
        get(locationAtom).searchParams
      );
      newSearchParams.set(name, value as string);
      set(locationAtom, (prev) => ({
        ...prev,
        searchParams: newSearchParams,
      }));
    }
  );
}

export const bookIdAtom = atomFromQueryString('bookId');

export const bookAtom = atom<Promise<RawBook | null>>(async (get) => {
  const bookDataList = await get(bookListAtom);
  if (!bookDataList) {
    return null;
  }

  const bookId =
    bookDataList.length == 1 ? bookDataList[0].id : get(bookIdAtom);
  if (!bookId) {
    return null;
  }

  const bookData = bookDataList.find((b) => b.id === bookId);
  if (!bookData) {
    return null;
  }

  const book = {
    ...bookData,
    ...(await fetch(bookData.url).then((res) => res.json())),
  };

  return book as unknown as RawBook;
});

export const bookLanguageAtom =
  atomFromQueryString<LanguageCode>('bookLanguage');

// export const bookAtom = atom(
//   async (get) => {
//
//   },
//   async (get,set,bookId) => {},
// );

export const bookLanguagesAtom = atom<Promise<Array<LanguageCode>>>(
  async (get) => {
    const bookData = await get(bookAtom);
    return Object.keys(bookData?.PAGES ?? []) as Array<LanguageCode>;
  }
);

export const bookAutoplayAtom = atomFromQueryString<boolean>('bookAutoplay');

export const bookPageAtom = atomFromQueryString<string>('bookPage', '1');
