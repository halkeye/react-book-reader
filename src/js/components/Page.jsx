const React = require('react');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');

let Page = React.createClass({
  componentDidMount() {
    BookStore.getPage(this.props.book, this.props.language, this.props.page).then((page) => {
      this.setState({ page: page });
    }).catch((ex) => {
      console.log('getPage error: ' + ex);
    });
  },

  getInitialState() {
    return {
      page: {
        images: []
      }
    }
  },

  getDivStyle() {
    let ret = {
      position: 'relative',
      width: '1024px', // fixme
      height: '768px', // fixme
    };
    if (this.state.page.pageImage) {
      ret.backgroundImage = 'url(' + this.state.page.pageImage + ')';
    }
    return ret;
  },

  render() {
    let divStyle = this.getDivStyle();

    let key = [
      "book", this.props.book,
      "language", this.props.language,
      "page", this.props.page
    ].join("_");

    let extraImages = this.state.page.images.map((image,idx) => {
      var style = {
        position: 'absolute',
        top: image.top + '%',
        left: image.left + '%',
      };
      return (
        <span style={style}>
          <img src={image.image} />
        </span>
      );
    });

    return (
      <div key={key} style={divStyle}>
        {extraImages}
      </div>
    )
  }
})
module.exports = Page;

