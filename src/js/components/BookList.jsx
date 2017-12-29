import ImmutablePropTypes from 'react-immutable-proptypes';
const React = require('react');
const PropTypes = require('prop-types');
const { RaisedButton } = require('material-ui');
const { chooseBook } = require('../actions.js');

class BookList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    books: ImmutablePropTypes.list.isRequired
  };

  render () {
    if (this.props.books.size === 1) {
      this.handleSelectBookClick(this.props.books.get(0).id);
      return <div>Auto selecting book</div>;
    }

    let booksStr = this.props.books.map(book => {
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
    this.props.dispatch(chooseBook(this.props.books.find(b => b.id === bookId)));
  }
}

module.exports = BookList;
