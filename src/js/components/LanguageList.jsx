const React = require('react');
const mui = require('material-ui');
const navigate = require('react-mini-router').navigate;
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
    return (
      <Dialog
        title="Select a language"
        openImmediately={true}
      >
        {languages}
      </Dialog>
    );
  },

  handleSelectLanguageClick(language) {
    navigate('/book/' + this.props.book + '/lang/' + language);
  }
});

module.exports = LanguageList;


