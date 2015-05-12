const React = require('react');
const BookActionCreators = require('../actions/BookActionCreators');
const BookStore = require('../stores/BookStore');

const mui = require('material-ui');
let {IconButton} = mui;

let BookPageMixin = {
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
        images: [],
        lines: []
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
      ret.backgroundSize = 'contain';
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
        width: image.width + '%',
        height: image.height + '%',
      };
      if (image.nextPage) {
        style.border = 'none';
        style.backgroundSize = 'contain';
        style.backgroundColor = 'rgba(0,0,0,0.0)';
        style.backgroundImage = 'url(' + image.image + ')';
        return (
          <IconButton style={style} onClick={this.onButtonClick.bind(this,image.nextPage)}></IconButton>
        );
      }
      return <img style={style} src={image.image} />;
    });

    let extraLines = this.state.page.lines.map((line,idx) => {
      let words = line.words.map((word,idx) => {
        return <span>{word.word} </span>;
      });
      var style = {
        position: 'absolute',
        top: line.top + '%',
        left: line.left + '%',
        color: this.state.page.pageStyle.unread.color,
        fontFamily: this.state.page.pageStyle.unread.font,
        fontSize: this.state.page.pageStyle.unread.size + 'px'
      };
      return <div style={style}>{words}</div>;
    });

    return (
      <div key={key} style={divStyle}>
        {extraImages}
        {extraLines}
      </div>
    )
  },

  onButtonClick(page) {
    if (page == 'read' || page == 'readAudio') {
      page = 1;
    }
    BookActionCreators.choosePage(
      this.props.book,
      this.props.language,
      page
    );
  }
};

module.exports = BookPageMixin;
