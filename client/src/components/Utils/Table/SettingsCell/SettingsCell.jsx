import React from 'react';
import PropTypes from 'prop-types';

import { Dropdown, DropdownStyle } from '../../Dropdown';
import { Input, InputStyle } from '../../Input';
import { Radio, RadioSize } from '../../Radio';

const SettingsCell = React.memo(({ value, cellClassName, title, ariaLabel, options, placeholder, isCustomComponent, CustomComponent, onChange, onSubmit, ...props }) => {
  return (
    <div className={cellClassName} aria-label={ariaLabel}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {typeof value === 'boolean' && <Radio size={RadioSize.Size12} checked={value} onChange={onChange} title={title} {...props} />}
      {typeof value === 'object' && !isCustomComponent && (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Dropdown style={DropdownStyle.FullWidth} options={options} placeholder={placeholder} defaultItem={value} onChange={onChange} {...props} />
      )}
      {typeof value === 'object' && isCustomComponent && (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CustomComponent value={value} title={title} ariaLabel={ariaLabel} options={options} placeholder={placeholder} onChange={onChange} onSubmit={onSubmit} {...props} />
      )}
      {typeof value === 'string' && (
        <Input
          style={InputStyle.FullWidth}
          value={value}
          onChange={(e) => onChange(e)}
          onSubmit={(e) => onSubmit(e)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
          title={title}
          placeholder={placeholder}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      )}
    </div>
  );
});

SettingsCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.object, PropTypes.string]),
  cellClassName: PropTypes.string,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string,
  isCustomComponent: PropTypes.bool,
  CustomComponent: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

SettingsCell.defaultProps = {
  value: undefined,
  cellClassName: '',
  title: '',
  ariaLabel: '',
  options: [],
  placeholder: '',
  isCustomComponent: false,
  CustomComponent: undefined,
  onChange: () => {},
  onSubmit: () => {},
};

export default SettingsCell;
