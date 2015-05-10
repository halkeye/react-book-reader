const React = require('react');
const mui = require('material-ui');
const navigate = require('react-mini-router').navigate;

const BookStore = require('../stores/BookStore');

let {RaisedButton,Dialog} = mui;

let BookList = React.createClass({
  render: function() {
    let {books} = this.props;
    let booksStr = books.map((book,i) => {
      let icon = BookStore.getIcon(book);
      return (
        <div id={book.id}>
          <RaisedButton onClick={this.handleSelectBookClick.bind(this,i)}>
            <img src={icon} />
            <span className="mui-raised-button-label">
              {book.title}
            </span>
          </RaisedButton>
        </div>
      );
    });
    return (
      <Dialog
        title="Select a book"
        openImmediately={true}
      >
        {booksStr}
      </Dialog>
    );
  },

  handleSelectBookClick(i) {
    navigate('/book/' + this.props.books[i].id);
  }
});

module.exports = BookList;

