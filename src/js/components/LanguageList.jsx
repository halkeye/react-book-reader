const React = require('react');
const mui = require('material-ui');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');

const DocumentTitle = require('react-document-title');
const LanguageIcon = require('./LanguageIcon.jsx');

let {RaisedButton, Dialog} = mui;

class LanguageList extends React.Component {
  state = {
    book: null
  };

  componentDidMount() {
    BookStore.getAll().then((books) => {
      this.setState({ book: books.filter((elm) => { return elm.id === this.props.book; })[0] });
    });
  }

  render() {
    if (this.state.book === null) { return <div>Loading...</div>; }
    if (this.state.book.languages.length === 1) {
      return this.handleSelectLanguageClick(this.state.book.languages[0]);
    }

    let languages = this.state.book.languages.map((language) => {
      return (
        <button className='button' key={language} onClick={this.handleSelectLanguageClick.bind(this, language)}>
          <LanguageIcon language={language} />
        </button>
      );
    });

    let circularIcon = { backgroundImage: 'url(' + this.state.book.iconBig + ')' };
    return (
      <DocumentTitle title="Select a language">
        <div className='LanguageList'>
          <img className='bookIcon' style={circularIcon} />
          <h1>Select a language</h1>
          {languages}
        </div>
      </DocumentTitle>
    );
  }

  handleSelectLanguageClick = (language) => {
    BookActionCreators.chooseLanguage(this.props.book, language);
  };
}

module.exports = LanguageList;


