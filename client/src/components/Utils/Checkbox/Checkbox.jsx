import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckboxSize from './CheckboxSize';

import styles from './Checkbox.module.scss';

const Checkbox = React.forwardRef(({ size, className, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input type="checkbox" ref={ref} className={classNames(styles.checkbox, styles[size], className)} {...props} />
  );
});

Checkbox.propTypes = {
  size: PropTypes.oneOf(Object.values(CheckboxSize)),
  className: PropTypes.string,
};

Checkbox.defaultProps = {
  size: CheckboxSize.Size20,
  className: undefined,
};

export default React.memo(Checkbox);
