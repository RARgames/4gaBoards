import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ButtonStyle from './ButtonStyle';
import styles from './ButtonTmp.module.scss';

// TODO change name to Button
// TODO default should be icon (probably rename icon to without background)
// TODO by default apply styles.base so even the button without style looks good
const ButtonTmp = React.forwardRef(({ children, title, type, style, content, className, ...rest }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading, react/button-has-type
    <button ref={ref} title={title || content} type={type || (style === ButtonStyle.Submit ? 'submit' : 'button')} className={classNames(style && styles[style], className)} {...rest}>
      {content !== undefined ? content : children}
    </button>
  );
});

ButtonTmp.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.oneOf(Object.values(ButtonStyle)),
  content: PropTypes.string,
  className: PropTypes.string,
};

ButtonTmp.defaultProps = {
  children: undefined,
  title: undefined,
  type: undefined,
  style: undefined,
  content: undefined,
  className: undefined,
};

export default React.memo(ButtonTmp);
