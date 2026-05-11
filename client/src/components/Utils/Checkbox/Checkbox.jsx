import React, { useId } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import CheckboxSize from './CheckboxSize';

import * as s from './Checkbox.module.scss';

const Checkbox = React.forwardRef(({ size, wrapperClassName, checkboxClassName, labelClassName, isError, label, title, ...props }, ref) => {
  const reactId = useId();

  return (
    <label className={clsx(s.wrapper, wrapperClassName)} htmlFor={reactId} title={title || label}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input id={reactId} type="checkbox" ref={ref} className={clsx(s.checkbox, s[size], checkboxClassName, isError && s.checkboxError)} {...props} />
      {label && <span className={clsx(s.label, labelClassName)}>{label}</span>}
    </label>
  );
});

Checkbox.propTypes = {
  size: PropTypes.oneOf(Object.values(CheckboxSize)),
  wrapperClassName: PropTypes.string,
  checkboxClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  isError: PropTypes.bool,
  label: PropTypes.string,
  title: PropTypes.string,
};

Checkbox.defaultProps = {
  size: CheckboxSize.Size20,
  wrapperClassName: undefined,
  checkboxClassName: undefined,
  labelClassName: undefined,
  isError: false,
  label: undefined,
  title: undefined,
};

export default React.memo(Checkbox);
