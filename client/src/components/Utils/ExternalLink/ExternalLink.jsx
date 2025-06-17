import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './ExternalLink.module.scss';

const ExternalLink = React.forwardRef(({ children, target, rel, className, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <a ref={ref} target={target} rel={rel} className={clsx(s.link, className)} {...props}>
      {children}
    </a>
  );
});

ExternalLink.propTypes = {
  children: PropTypes.node,
  target: PropTypes.string,
  rel: PropTypes.string,
  className: PropTypes.string,
};

ExternalLink.defaultProps = {
  children: undefined,
  target: '_blank',
  rel: 'noreferrer noopener',
  className: undefined,
};

export default React.memo(ExternalLink);
