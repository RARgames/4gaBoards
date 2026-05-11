import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import LoaderSize from './LoaderSize';

import * as s from './Loader.module.scss';

const Loader = React.forwardRef(({ size, wrapperClassName, className, ...props }, ref) => {
  return (
    <div className={clsx(s.loaderWrapper, wrapperClassName)}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div ref={ref} className={clsx(s.loader, s[size], className)} {...props} />
    </div>
  );
});

Loader.propTypes = {
  size: PropTypes.oneOf(Object.values(LoaderSize)).isRequired,
  wrapperClassName: PropTypes.string,
  className: PropTypes.string,
};

Loader.defaultProps = {
  wrapperClassName: undefined,
  className: undefined,
};

export default React.memo(Loader);
