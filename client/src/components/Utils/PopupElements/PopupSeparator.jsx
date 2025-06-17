import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './PopupSeparator.module.scss';

const PopupSeparator = React.memo(({ className }) => {
  return <div className={clsx(s.separator, className)} />;
});

PopupSeparator.propTypes = {
  className: PropTypes.string,
};

PopupSeparator.defaultProps = {
  className: undefined,
};

export default PopupSeparator;
