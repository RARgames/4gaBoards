import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormStyle from './FormStyle';
import styles from './Form.module.scss';

const Form = React.forwardRef(({ onSubmit, children, style, className, ...props }, ref) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <form ref={ref} onSubmit={handleSubmit} className={classNames(styles.form, style && styles[style], className)} {...props}>
      {children}
    </form>
  );
});

Form.propTypes = {
  onSubmit: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.oneOf(Object.values(FormStyle)),
  className: PropTypes.string,
};

Form.defaultProps = {
  onSubmit: undefined,
  children: undefined,
  style: undefined,
  className: undefined,
};

export default React.memo(Form);
