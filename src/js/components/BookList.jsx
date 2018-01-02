import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';

export default class BookList extends React.PureComponent {
  static propTypes = {
    onChooseBook: PropTypes.func.isRequired,
    books: ImmutablePropTypes.list
  };

  static defaultProps = {
    books: new List([])
  };

  constructor (props) {
    super(props);
    if (props.books.size === 1) {
      this.handleSelectBookClick(props.books.get(0));
    }
  }
  componentWillReceiveProps (nextProps) {
    if (this.props.books !== nextProps.books) {
      if (nextProps.books.size === 1) {
        this.handleSelectBookClick(nextProps.books.get(0));
      }
    }
  }

  render () {
    if (this.props.books.size === 0) {
      return <div>Loading Books...</div>;
    }

    if (this.props.books.size === 1) {
      return null;
    }

    const contents = this.props.books.map(book => {
      return (
        <div key={book.id} id={book.id}>
          <Button raised onClick={this.handleSelectBookClick.bind(this, book)}>
            <img src={book.icon} />
            <span className="mui-raised-button-label">{book.title}</span>
          </Button>
        </div>
      );
    });
    return <div>{contents}</div>;
  }

  handleSelectBookClick (book) {
    this.props.onChooseBook(book);
  }
}
