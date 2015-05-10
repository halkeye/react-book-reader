const React = require('react');
const mui = require('material-ui');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');

let {RaisedButton,Dialog} = mui;

let LanguageList = React.createClass({
  componentDidMount() {
    BookStore.getLanguages(this.props.book).then((languages) => {
      this.setState({ languages: languages });
    });
  },
  getInitialState() {
    return {
      languages: []
    }
  },
  render: function() {
    if (this.state.languages.length === 1) {
      return this.handleSelectLanguageClick(this.state.languages[0]);
    }

    let languages = this.state.languages.map((language) => {
      return (
        <div key={language}>
          <RaisedButton onClick={this.handleSelectLanguageClick.bind(this,language)}>
            <span className="mui-raised-button-label">
              {language}
            </span>
          </RaisedButton>
        </div>
      );
    });
    return <div>{languages}</div>;
  },

  handleSelectLanguageClick(language) {
    BookActionCreators.chooseLanguage(this.props.book, language)
  }
});

module.exports = LanguageList;


