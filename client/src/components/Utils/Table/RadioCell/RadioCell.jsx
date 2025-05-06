import React from 'react';
import PropTypes from 'prop-types';

import { Radio, RadioSize } from '../../Radio';

const RadioCell = React.memo(({ id, checked, cellClassName, className, title, ariaLabel, onChange, getIsDisabled }) => {
  return (
    <div className={cellClassName}>
      <Radio size={RadioSize.Size12} checked={checked} title={title} disabled={getIsDisabled(id)} onChange={() => onChange(id, checked)} aria-label={ariaLabel} className={className} />
    </div>
  );
});

RadioCell.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  cellClassName: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  getIsDisabled: PropTypes.func,
};

RadioCell.defaultProps = {
  cellClassName: '',
  className: '',
  title: '',
  ariaLabel: '',
  getIsDisabled: () => {
    return false;
  },
};

export default RadioCell;
