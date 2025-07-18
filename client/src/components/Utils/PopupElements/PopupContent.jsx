import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './PopupContent.module.scss';

const PopupContent = React.memo(({ children, isMinContent, isWidthLimited, className, ...props }) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={clsx(s.wrapper, className, isMinContent && s.minContent, isWidthLimited && s.limitedWidth)} {...props}>
      {children}
    </div>
  );
});

PopupContent.propTypes = {
  children: PropTypes.node.isRequired,
  isMinContent: PropTypes.bool,
  isWidthLimited: PropTypes.bool,
  className: PropTypes.string,
};

PopupContent.defaultProps = {
  isMinContent: false,
  isWidthLimited: false,
  className: undefined,
};

export default PopupContent;
