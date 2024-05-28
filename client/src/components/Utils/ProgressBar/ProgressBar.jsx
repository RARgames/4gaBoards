import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ProgressBarSize from './ProgressBarSize';

import styles from './ProgressBar.module.scss';

const ProgressBar = React.forwardRef(({ value, total, color, size, className, ...props }, ref) => {
  const percentage = (value / total) * 100;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} className={classNames(styles.progressContainer, className)} {...props}>
      <div className={classNames(styles.progressBar, size && styles[size])} style={{ width: `${percentage}%`, backgroundColor: color }} />
    </div>
  );
});

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(ProgressBarSize)).isRequired,
  className: PropTypes.string,
};

ProgressBar.defaultProps = {
  className: undefined,
};

export default React.memo(ProgressBar);
