import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import ProgressBarSize from './ProgressBarSize';

import * as s from './ProgressBar.module.scss';

const ProgressBar = React.forwardRef(({ value, total, color, size, className, ...props }, ref) => {
  const percentage = (value / total) * 100;

  const getDefaultColor = useCallback(() => {
    if (percentage < 25) {
      return s.red;
    }
    if (percentage < 50) {
      return s.orange;
    }
    if (percentage < 75) {
      return s.yellow;
    }
    if (percentage < 90) {
      return s.olive;
    }
    return s.green;
  }, [percentage]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} className={classNames(s.progressContainer, className)} {...props}>
      <div className={classNames(s.progressBar, size && s[size], color === undefined && getDefaultColor())} style={{ width: `${percentage}%`, backgroundColor: color }} />
    </div>
  );
});

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string,
  size: PropTypes.oneOf(Object.values(ProgressBarSize)).isRequired,
  className: PropTypes.string,
};

ProgressBar.defaultProps = {
  color: undefined,
  className: undefined,
};

export default React.memo(ProgressBar);
