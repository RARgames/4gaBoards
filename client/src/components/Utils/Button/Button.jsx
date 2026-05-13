import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ButtonVariant from './ButtonVariant';

import * as s from './Button.module.scss';

const Button = React.forwardRef(({ children, title, type, variant, content, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      title={title || content}
      type={type || (variant === ButtonVariant.Submit ? 'submit' : 'button')} // eslint-disable-line react/button-has-type
      className={clsx(s.button, variant && s[variant], className)}
      {...props} // eslint-disable-line react/jsx-props-no-spreading
    >
      {content !== undefined ? content : children}
    </button>
  );
});

Button.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(ButtonVariant)),
  content: PropTypes.string,
  className: PropTypes.string,
};

Button.defaultProps = {
  children: undefined,
  title: undefined,
  type: undefined,
  variant: undefined,
  content: undefined,
  className: undefined,
};

export default React.memo(Button);
