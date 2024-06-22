import React from 'react';
import LanguageIcon from './LanguageIcon.jsx';
import { Helmet } from 'react-helmet-async';
import {
  LanguageCode,
  bookAtom,
  bookLanguageAtom,
  bookLanguagesAtom,
} from '../atoms.js';
import { useAtom } from 'jotai';

const LanguageButton = ({ languageCode }: { languageCode: string }) => {
  const [, setLanguage] = useAtom(bookLanguageAtom);
  const handleSelectLanguageClick = React.useCallback(
    () => setLanguage(languageCode as LanguageCode),
    [setLanguage, languageCode]
  );

  return (
    <button
      className="button"
      key={languageCode}
      onClick={handleSelectLanguageClick}
    >
      <LanguageIcon languageCode={languageCode} />
    </button>
  );
};

const LanguageList = () => {
  const [book] = useAtom(bookAtom);
  const [languages] = useAtom(bookLanguagesAtom);
  const circularIcon = { backgroundImage: `url('${book?.iconBig}')` };
  return (
    <>
      <Helmet>
        <title>Select a language</title>
      </Helmet>
      <div className="LanguageList">
        <img className="bookIcon" style={circularIcon} />
        <h1>Select a language</h1>
        {languages.map((languageCode) => (
          <LanguageButton key={languageCode} languageCode={languageCode} />
        ))}
      </div>
    </>
  );
};

export default LanguageList;
