import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import IconType from './IconType';
import IconSize from './IconSize';

import styles from './Icon.module.scss';

const Icon = React.memo(({ type, size, className, ...rest }) => {
  const IconComponent = type;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return type ? <IconComponent className={classNames(styles.defaultIcon, styles[size], className)} {...rest} /> : null;
});

Icon.propTypes = {
  type: PropTypes.oneOf(Object.values(IconType)).isRequired,
  size: PropTypes.oneOf(Object.values(IconSize)).isRequired,
  className: PropTypes.string,
};

Icon.defaultProps = {
  className: undefined,
};

export default Icon;
