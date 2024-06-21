import React from 'react';
import LanguageIcon from './LanguageIcon.jsx';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch } from '../store';

interface Props {
  languages: Array<string>;
  iconBig: string;
}

const LanguageButton = ({ languageCode }: { languageCode: string }) => {
  const dispatch = useAppDispatch();
  const handleSelectLanguageClick = React.useCallback(
    (languageCode: string) => {
      dispatch(chooseLanguage(languageCode));
    },
    [dispatch, languageCode]
  );

  return (
    <button
      className="button"
      key={languageCode}
      onClick={() => handleSelectLanguageClick(languageCode)}
    >
      <LanguageIcon languageCode={languageCode} />
    </button>
  );
};

const LanguageList = ({ iconBig, languages }: Props) => {
  const circularIcon = { backgroundImage: `url('${iconBig}')` };
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
