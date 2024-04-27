import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './ButtonTmp.module.scss';

const ButtonType = {
  Default: 'defaultButton',
  Icon: 'iconButton',
};
// TODO change name to Button
// TODO default should be icon (probably rename icon to without background)
const ButtonTmp = React.memo(({ children, type, className, ...rest }) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <button type="button" className={classNames(styles[type], className)} {...rest}>
      {children}
    </button>
  );
});

ButtonTmp.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(ButtonType)).isRequired,
  className: PropTypes.string,
};

ButtonTmp.defaultProps = {
  className: undefined,
};

export { ButtonTmp, ButtonType };
