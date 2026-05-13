import React from 'react';
import MaskedInputComponent from 'react-input-mask';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import InputVariant from './InputVariant';

import * as s from './Input.module.scss';

class MaskedInput extends MaskedInputComponent {
  focus(options) {
    this.getInputDOMNode().focus(options);
  }

  select() {
    this.getInputDOMNode().select();
  }
}

const InputMask = React.forwardRef(({ variant, className, mask, maskChar, isError, ...props }, ref) => {
  const variants = Array.isArray(variant) ? variant.map((v) => s[v]) : variant && s[variant];
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MaskedInput ref={ref} className={clsx(s.input, variants, className, isError && s.inputError)} mask={mask} maskChar={maskChar} {...props} />;
});

InputMask.propTypes = {
  variant: PropTypes.oneOfType([PropTypes.oneOf(Object.values(InputVariant)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(InputVariant)))]),
  className: PropTypes.string,
  mask: PropTypes.string.isRequired,
  maskChar: PropTypes.string,
  isError: PropTypes.bool,
};

InputMask.defaultProps = {
  variant: undefined,
  className: undefined,
  maskChar: undefined,
  isError: false,
};

export default React.memo(InputMask);
