import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import MaskedInput from './MaskedInput';

import InputStyle from './InputStyle';
import styles from './Input.module.scss';

const InputMask = React.forwardRef(({ style, className, mask, maskChar, ...props }, ref) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MaskedInput ref={ref} className={classNames(styles.base, style && styles[style], className)} mask={mask} maskChar={maskChar} {...props} />;
});

InputMask.propTypes = {
  style: PropTypes.oneOf(Object.values(InputStyle)),
  className: PropTypes.string,
  mask: PropTypes.string.isRequired,
  maskChar: PropTypes.string,
};

InputMask.defaultProps = {
  style: undefined,
  className: undefined,
  maskChar: undefined,
};

export default React.memo(InputMask);
