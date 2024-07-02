import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Checkbox.module.scss';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input type="checkbox" ref={ref} className={classNames(styles.checkbox, className)} {...props} />
  );
});

Checkbox.propTypes = {
  className: PropTypes.string,
};

Checkbox.defaultProps = {
  className: undefined,
};

export default React.memo(Checkbox);
