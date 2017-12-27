const React = require('react');
const PropTypes = require('prop-types');
const mui = require('material-ui');

const { chooseBook } = require('../actions.js');
const BookStore = require('../stores/BookStore');

let { RaisedButton } = mui;

class BookList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    bookName: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = { books: [] };
  }

  componentDidMount () {
    BookStore.getAll().then(books => {
      this.setState({ books: books });
    });
  }

  render () {
    if (this.state.books.length === 1) {
      this.handleSelectBookClick(this.state.books[0].id);
      return <div>Auto selecting book</div>;
    }

    let booksStr = this.state.books.map(book => {
      return (
        <div key={book.id} id={book.id}>
          <RaisedButton
            onClick={this.handleSelectBookClick.bind(this, book.id)}
          >
            <img src={book.icon} />
            <span className="mui-raised-button-label">{book.title}</span>
          </RaisedButton>
        </div>
      );
    });
    return <div>{booksStr}</div>;
  }

  handleSelectBookClick (bookId) {
    this.props.dispatch(chooseBook(bookId));
  }
}

module.exports = BookList;
