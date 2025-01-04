import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import * as s from './PopupSeparator.module.scss';

const PopupSeparator = React.memo(({ className }) => {
  return <div className={classNames(s.separator, className)} />;
});

PopupSeparator.propTypes = {
  className: PropTypes.string,
};

PopupSeparator.defaultProps = {
  className: undefined,
};

export default PopupSeparator;
