import React from 'react';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

Skeleton.propTypes = {
  className: PropTypes.string,
};

Skeleton.defaultProps = {
  className: undefined,
};

export { Skeleton };
