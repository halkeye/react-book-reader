import React from 'react';
import PropTypes from 'prop-types';

export default function ProgressBar ({ total, loaded }) {
  if (total === null || loaded === null) {
    return null;
  }

  let percent = 0;
  if (total && this.props.loaded) {
    percent = loaded / this.props.total * 100;
  }

  let style = {
    width: Math.max(0, Math.min(percent, 100)) + '%',
    transition: 'width 200ms'
  };

  return (
    <div className="progressbar-container">
      <div className="progressbar-progress" style={style} />
    </div>
  );
}

ProgressBar.propTypes = {
  total: PropTypes.number,
  loaded: PropTypes.number
};

ProgressBar.defaultProps = {
  total: null,
  loaded: null
};
