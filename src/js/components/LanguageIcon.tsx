import React from 'react';

const languageMap: Record<string, string> = {
  en: 'English',
  fr: 'French',
};

interface Props {
  languageCode: string;
}

const LanguageIcon: React.FC<Props> = ({ languageCode }) => {
  const str = languageMap[languageCode] || languageCode;
  const classString = '';
  return <span className={classString}>{str}</span>;
};

export default LanguageIcon;
