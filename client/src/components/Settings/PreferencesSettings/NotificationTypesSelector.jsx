import React, { useCallback } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Checkbox2, CheckboxSize } from '../../Utils';

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
          <Checkbox2
            key={option.id}
            size={CheckboxSize.Size14}
            checked={active}
            label={option.name}
            onChange={() => handleToggle(option)}
            wrapperClassName={clsx(s.item, active && s.itemActive)}
            labelClassName={clsx(s.label, active && s.labelActive)}
          />
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
