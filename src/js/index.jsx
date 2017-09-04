//const React = require('react');
//const router = require('./router.jsx');
//const rootEl = document.getElementById('main');
//router.run((Handler, state) =>
//  React.render(<Handler {...state} />, rootEl)
//);

const React = require('react');
const { render } = require('react-dom');
const App = require('./components/App.jsx');
render(<App />, document.getElementById('main'));
