import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import InputVariant from './InputVariant';

import * as s from './Input.module.scss';

const Input = React.memo(
  React.forwardRef(({ variant, className, isError, ...props }, ref) => {
    const variants = Array.isArray(variant) ? variant.map((v) => s[v]) : variant && s[variant];
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <input ref={ref} className={clsx(s.input, variants, className, isError && s.inputError)} {...props} />;
  }),
);

Input.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.oneOf(Object.values(InputVariant)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(InputVariant)))]),
  className: PropTypes.string,
  isError: PropTypes.bool,
};

Input.defaultProps = {
  variant: undefined,
  className: undefined,
  isError: false,
};

export default Input;
