const React = require('react');
const mui = require('material-ui');
const RouterMixin = require('react-mini-router').RouterMixin;

/* Components */
let {RaisedButton} = mui;
const BookList = require('./BookList.jsx');
const LanguageList = require('./LanguageList.jsx');

let App = React.createClass({
  mixins: [RouterMixin],

  routes: {
    '/': 'selectBook',
    '/book/:book': 'selectLanguage',
    '/book/:book/lang/:language': 'showHome',
    '/book/:book/lang/:language/page/:page': 'showPage',
  },

  notFound: function(path) {
    return <div class="not-found">Page Not Found: {path}</div>;
  },

  render: function() {
    return this.renderCurrentRoute();
  },

  selectLanguage(book) {
    return <div><LanguageList book={book} /></div>;
  },

  selectBook() {
    return <BookList />;
  },

  showHome(book,language) {
    return (
    <div>
      <h1>HOME - {book} - {language}</h1>
      <ul>
        <li>
          UI.PAGE_HOME
          <ul>
            <li>
              BUTTONS
              <ul>
                <li>games</li>
                <li>readAudio</li>
                <li>read</li>
              </ul>
            </li>
            <li>
              IMAGE
              <ul>
                <li>title_[lang]</li>
                <li>subtitle_[lang]</li>
                <li>RBMbutton_[lang]</li>
                <li>PGbutton_[lang]</li>
                <li>RTMbutton_[lang]</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    );
  },

});

module.exports = App;
