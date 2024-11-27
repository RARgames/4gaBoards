import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Form = React.forwardRef(({ onSubmit, children, className, ...props }, ref) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    // TODO temp removed: s.form
    // eslint-disable-next-line react/jsx-props-no-spreading
    <form ref={ref} onSubmit={handleSubmit} className={classNames(className)} {...props}>
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
