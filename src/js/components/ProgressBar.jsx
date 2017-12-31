import React from 'react';
import PropTypes from 'prop-types';
import { Line, Circle } from 'rc-progress';

export default function ProgressBar ({ total, loaded }) {
  if (total === null || loaded === null) {
    return null;
  }

  let percent = 0;
  if (total && loaded) {
    percent = loaded / total * 100;
  }

  return (
    <div>
      <h1>Loading {percent}%</h1>
      <div style={{ margin: 10, width: 600 }}>
        <Circle percent={percent} strokeWidth="6" />;
      </div>
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
