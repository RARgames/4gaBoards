import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import ButtonStyle from './ButtonStyle';

import * as s from './Button.module.scss';

const Button = React.forwardRef(({ children, title, type, style, content, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      title={title || content}
      type={type || (style === ButtonStyle.Submit ? 'submit' : 'button')} // eslint-disable-line react/button-has-type
      className={classNames(s.button, style && s[style], className)}
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
  style: PropTypes.oneOf(Object.values(ButtonStyle)),
  content: PropTypes.string,
  className: PropTypes.string,
};

Button.defaultProps = {
  children: undefined,
  title: undefined,
  type: undefined,
  style: undefined,
  content: undefined,
  className: undefined,
};

export default React.memo(Button);
