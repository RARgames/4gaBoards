import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './PopupSeparator.module.scss';

const PopupSeparator = React.memo(({ className }) => {
  return <div className={classNames(styles.separator, className)} />;
});

PopupSeparator.propTypes = {
  className: PropTypes.string,
};

PopupSeparator.defaultProps = {
  className: undefined,
};

export default PopupSeparator;
