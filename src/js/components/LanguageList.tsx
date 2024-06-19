import React from "react";
import PropTypes from "prop-types";
import { chooseLanguage } from "../actions.js";
import DocumentTitle from "react-document-title";
import LanguageIcon from "./LanguageIcon.jsx";

class LanguageList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    languages: PropTypes.array,
    iconBig: PropTypes.string,
  };

  render() {
    const { languages } = this.props;
    if (!languages) {
      return <div>Loading...</div>;
    }
    if (languages.length === 1) {
      return this.handleSelectLanguageClick(languages[0]);
    }

    let html = languages.map((language) => {
      return (
        <button
          className="button"
          key={language}
          onClick={this.handleSelectLanguageClick.bind(this, language)}
        >
          <LanguageIcon language={language} />
        </button>
      );
    });

    let circularIcon = {
      backgroundImage: "url(" + this.props.iconBig + ")",
    };
    return (
      <DocumentTitle title="Select a language">
        <div className="LanguageList">
          <img className="bookIcon" style={circularIcon} />
          <h1>Select a language</h1>
          {html}
        </div>
      </DocumentTitle>
    );
  }

  handleSelectLanguageClick(language) {
    this.props.dispatch(chooseLanguage(language));
  }
}

export default LanguageList;
