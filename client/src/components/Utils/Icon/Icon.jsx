import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import FlagType from './FlagType';
import IconSize from './IconSize';
import IconType from './IconType';

import * as s from './Icon.module.scss';

const Icon = React.memo(({ type, size, className, ...props }) => {
  const IconComponent = type;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return type ? <IconComponent className={classNames(s.icon, s[size], className)} {...props} /> : null;
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
