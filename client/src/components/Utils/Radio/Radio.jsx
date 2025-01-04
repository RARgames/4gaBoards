import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import * as s from './Radio.module.scss';

const Radio = React.forwardRef(({ checked, disabled, size, className, onChange, ...props }, ref) => {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label ref={ref} className={classNames(s.radio, size && s[size], disabled && s.radioDisabled, className)}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input type="checkbox" className={s.input} checked={checked} disabled={disabled} onChange={onChange} {...props} />
      <span className={s.switchRound} />
    </label>
  );
});

Radio.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

Radio.defaultProps = {
  disabled: false,
  size: undefined,
  className: undefined,
};

export default React.memo(Radio);
