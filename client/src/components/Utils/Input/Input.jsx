import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import InputStyle from './InputStyle';

import * as s from './Input.module.scss';

const Input = React.memo(
  React.forwardRef(({ style, className, isError, ...props }, ref) => {
    const styles = Array.isArray(style) ? style.map((st) => s[st]) : style && s[style];
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <input ref={ref} className={clsx(s.input, styles, className, isError && s.inputError)} {...props} />;
  }),
);

Input.propTypes = {
  style: PropTypes.oneOfType([PropTypes.oneOf(Object.values(InputStyle)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(InputStyle)))]),
  className: PropTypes.string,
  isError: PropTypes.bool,
};

Input.defaultProps = {
  style: undefined,
  className: undefined,
  isError: false,
};

export default Input;
