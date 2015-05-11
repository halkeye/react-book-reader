const React = require('react');

let languageMap = {
  'en': 'English',
  'fr': 'French'
};

let LanguageIcon = React.createClass({
  render: function() {
    let str = languageMap[this.props.language] || this.props.language;

    let classString = '';
    return (
      <span className={classString}>{str}</span>
    );
  }
});

module.exports = LanguageIcon;
