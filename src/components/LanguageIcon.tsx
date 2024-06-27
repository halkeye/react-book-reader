import React from 'react';

const languageMap: Record<string, string> = {
  en: 'English',
  fr: 'French',
};

interface Props {
  languageCode: string;
}

const LanguageIcon: React.FC<Props> = ({ languageCode }) => {
  const string_ = languageMap[languageCode] || languageCode;
  const classString = '';
  return <span className={classString}>{string_}</span>;
};

export default LanguageIcon;
