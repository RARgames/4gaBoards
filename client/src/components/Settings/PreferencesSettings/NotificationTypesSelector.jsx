import React, { useCallback } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Checkbox, CheckboxSize } from '../../Utils';

import * as s from './NotificationTypesSelector.module.scss';

const NotificationTypesSelector = React.memo(({ value, options, onChange }) => {
  const isSelected = useCallback((optionId) => value.includes(optionId), [value]);

  const handleToggle = useCallback(
    (option) => {
      onChange(option);
    },
    [onChange],
  );

  return (
    <div className={s.grid}>
      {options.map((option) => {
        const active = isSelected(option.id);

        return (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label key={option.id} className={clsx(s.item, active && s.itemActive)} title={option.name}>
            <Checkbox size={CheckboxSize.Size14} checked={active} onChange={() => handleToggle(option)} />
            <span className={s.label}>{option.name}</span>
          </label>
        );
      })}
    </div>
  );
});

NotificationTypesSelector.propTypes = {
  value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func,
};

NotificationTypesSelector.defaultProps = {
  options: [],
  onChange: () => {},
};

export default NotificationTypesSelector;
