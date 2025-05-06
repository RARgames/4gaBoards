import React from 'react';
import PropTypes from 'prop-types';

import { Dropdown, DropdownStyle } from '../../Dropdown';
import { Radio, RadioSize } from '../../Radio';

const SettingsCell = React.memo(({ value, cellClassName, title, ariaLabel, options, placeholder, onChange, ...props }) => {
  return (
    <div className={cellClassName} aria-label={ariaLabel}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {typeof value === 'boolean' && <Radio size={RadioSize.Size12} checked={value} onChange={onChange} title={title} {...props} />}
      {typeof value === 'object' && (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Dropdown style={DropdownStyle.FullWidth} options={options} placeholder={placeholder} defaultItem={value} onChange={onChange} {...props} />
      )}
    </div>
  );
});

SettingsCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  cellClassName: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

SettingsCell.defaultProps = {
  value: undefined,
  cellClassName: '',
  title: '',
  ariaLabel: '',
  options: [],
  placeholder: '',
};

export default SettingsCell;
