import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ButtonStyle from './ButtonStyle';
import styles from './ButtonTmp.module.scss';

// TODO change name to Button
// TODO default should be icon (probably rename icon to without background)
const ButtonTmp = React.forwardRef(({ children, type, style, className, ...rest }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading, react/button-has-type
    <button ref={ref} type={type || (style === ButtonStyle.Submit ? 'submit' : 'button')} className={classNames(style && styles[style], className)} {...rest}>
      {children}
    </button>
  );
});

ButtonTmp.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  style: PropTypes.oneOf(Object.values(ButtonStyle)),
  className: PropTypes.string,
};

ButtonTmp.defaultProps = {
  children: undefined,
  type: undefined,
  style: undefined,
  className: undefined,
};

export default React.memo(ButtonTmp);
