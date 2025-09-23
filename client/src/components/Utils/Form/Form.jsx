import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './Form.module.scss';

const Form = React.forwardRef(({ onSubmit, children, className, ...props }, ref) => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent reloading page after form submit (when submit button has no onClick handler)
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <form ref={ref} onSubmit={handleSubmit} className={clsx(s.form, className)} {...props}>
      {children}
    </form>
  );
});

Form.propTypes = {
  onSubmit: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

Form.defaultProps = {
  onSubmit: undefined,
  children: undefined,
  className: undefined,
};

export default React.memo(Form);
