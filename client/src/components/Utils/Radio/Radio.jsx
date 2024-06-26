import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Radio.module.scss';

const Radio = React.forwardRef(({ checked, onChange, size, className, ...props }, ref) => {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label ref={ref} className={classNames(styles.radio, size && styles[size], className)}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input type="checkbox" className={styles.input} checked={checked} onChange={onChange} {...props} />
      <span className={styles.switchRound} />
    </label>
  );
});

Radio.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.string,
  className: PropTypes.string,
};

Radio.defaultProps = {
  size: undefined,
  className: undefined,
};

export default React.memo(Radio);
