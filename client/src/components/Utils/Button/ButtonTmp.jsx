import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ButtonType from './ButtonType';
import styles from './ButtonTmp.module.scss';

// TODO change name to Button
// TODO default should be icon (probably rename icon to without background)
// TODO change buttonType to type and type to buttonType
const ButtonTmp = React.forwardRef(({ children, buttonType, type, className, ...rest }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading, react/button-has-type
    <button ref={ref} type={buttonType} className={classNames(type && styles[type], className)} {...rest}>
      {children}
    </button>
  );
});

ButtonTmp.propTypes = {
  children: PropTypes.node,
  buttonType: PropTypes.string,
  type: PropTypes.oneOf(Object.values(ButtonType)),
  className: PropTypes.string,
};

ButtonTmp.defaultProps = {
  children: undefined,
  buttonType: 'button',
  type: undefined,
  className: undefined,
};

export default React.memo(ButtonTmp);
