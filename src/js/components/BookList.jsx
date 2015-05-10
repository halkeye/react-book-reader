const React = require('react');
const mui = require('material-ui');
const navigate = require('react-mini-router').navigate;

const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');

let {RaisedButton,Dialog} = mui;

let BookList = React.createClass({
  componentDidMount() {
    BookStore.getAll().then((books) => {
      this.setState({ books: books });
    });
  },
  getInitialState() {
    return {
      books: []
    }
  },
  render: function() {
    if (this.state.books.length === 1) {
      return this.handleSelectBookClick(this.state.books[0].id);
    }

    let booksStr = this.state.books.map((book,i) => {
      return (
        <div id={book.id}>
          <RaisedButton onClick={this.handleSelectBookClick.bind(this,book.id)}>
            <img src={book.icon} />
            <span className="mui-raised-button-label">
              {book.title}
            </span>
          </RaisedButton>
        </div>
      );
    });
    return <div>{booksStr}</div>;
  },

  handleSelectBookClick(book) {
    BookActionCreators.chooseBook(book)
  }
});

module.exports = BookList;

