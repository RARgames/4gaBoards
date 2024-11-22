import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './PopupContent.module.scss';

const PopupContent = React.memo(({ children, className, ...props }) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={classNames(styles.wrapper, className)} {...props}>
      {children}
    </div>
  );
});

PopupContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

PopupContent.defaultProps = {
  className: undefined,
};

export default PopupContent;
