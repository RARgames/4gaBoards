import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import MaskedInput from './MaskedInput';

import InputStyle from './InputStyle';

import * as s from './Input.module.scss';

const InputMask = React.forwardRef(({ style, className, mask, maskChar, isError, ...props }, ref) => {
  const styles = Array.isArray(style) ? style.map((st) => s[st]) : style && s[style];
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MaskedInput ref={ref} className={classNames(s.input, styles, className, isError && s.inputError)} mask={mask} maskChar={maskChar} {...props} />;
});

InputMask.propTypes = {
  style: PropTypes.oneOfType([PropTypes.oneOf(Object.values(InputStyle)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(InputStyle)))]),
  className: PropTypes.string,
  mask: PropTypes.string.isRequired,
  maskChar: PropTypes.string,
  isError: PropTypes.bool,
};

InputMask.defaultProps = {
  style: undefined,
  className: undefined,
  maskChar: undefined,
  isError: false,
};

export default React.memo(InputMask);
