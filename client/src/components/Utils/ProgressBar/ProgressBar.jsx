import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ProgressBarSize from './ProgressBarSize';

import * as styles from './ProgressBar.module.scss';

const ProgressBar = React.forwardRef(({ value, total, color, size, className, ...props }, ref) => {
  const percentage = (value / total) * 100;

  const getDefaultColor = useCallback(() => {
    if (percentage < 25) {
      return styles.red;
    }
    if (percentage < 50) {
      return styles.orange;
    }
    if (percentage < 75) {
      return styles.yellow;
    }
    if (percentage < 90) {
      return styles.olive;
    }
    return styles.green;
  }, [percentage]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} className={classNames(styles.progressContainer, className)} {...props}>
      <div className={classNames(styles.progressBar, size && styles[size], color === undefined && getDefaultColor())} style={{ width: `${percentage}%`, backgroundColor: color }} />
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
