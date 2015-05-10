//const React = require('react');
//const router = require('./router.jsx');
//const rootEl = document.getElementById('main');
//router.run((Handler, state) =>
//  React.render(<Handler {...state} />, rootEl)
//);

const React = require('react');
const App = require('./components/App.jsx');
React.render(<App lang="en" url='../books/Josephine/BookData.json' />, document.getElementById('main'));
