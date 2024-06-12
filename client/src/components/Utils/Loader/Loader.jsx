import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LoaderSize from './LoaderSize';

import styles from './Loader.module.scss';

const Loader = React.forwardRef(({ size, wrapperClassName, className, ...props }, ref) => {
  return (
    <div className={classNames(styles.loaderWrapper, wrapperClassName)}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div ref={ref} className={classNames(styles.base, styles[size], className)} {...props} />
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
