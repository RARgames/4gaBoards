import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import InputStyle from './InputStyle';
import styles from './Input.module.scss';

const Input = React.memo(
  React.forwardRef(({ style, className, ...props }, ref) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <input ref={ref} className={classNames(styles.base, style && styles[style], className)} {...props} />;
  }),
);

Input.propTypes = {
  style: PropTypes.oneOf(Object.values(InputStyle)),
  className: PropTypes.string,
};

Input.defaultProps = {
  style: undefined,
  className: undefined,
};

export default Input;
