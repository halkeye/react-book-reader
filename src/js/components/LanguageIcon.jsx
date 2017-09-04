const React = require('react');

let languageMap = {
  'en': 'English',
  'fr': 'French'
};

class LanguageIcon extends React.Component {
  render() {
    let str = languageMap[this.props.language] || this.props.language;

    let classString = '';
    return (
      <span className={classString}>{str}</span>
    );
  }
}

module.exports = LanguageIcon;
