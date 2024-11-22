import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import IconType from './IconType';
import FlagType from './FlagType';
import IconSize from './IconSize';

import * as styles from './Icon.module.scss';

const Icon = React.memo(({ type, size, className, ...props }) => {
  const IconComponent = type;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return type ? <IconComponent className={classNames(styles.icon, styles[size], className)} {...props} /> : null;
});

Icon.propTypes = {
  type: PropTypes.oneOf([...Object.values(IconType), ...Object.values(FlagType)]).isRequired,
  size: PropTypes.oneOf(Object.values(IconSize)).isRequired,
  className: PropTypes.string,
};

Icon.defaultProps = {
  className: undefined,
};

export default Icon;
