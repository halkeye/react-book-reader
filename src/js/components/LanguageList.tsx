import React from 'react';
import { chooseLanguage } from '../actions.js';
import LanguageIcon from './LanguageIcon.jsx';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';

interface Props {
  languages: Array<string>;
  iconBig: string;
}

const LanguageButton = ({ languageCode }: { languageCode: string }) => {
  const dispatch = useDispatch();
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
  const dispatch = useDispatch();
  if (languages.length === 1) {
    dispatch(chooseLanguage(languages[0]));
    return null;
  }

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
          <LanguageButton languageCode={languageCode} />
        ))}
      </div>
    </>
  );
};

export default LanguageList;
