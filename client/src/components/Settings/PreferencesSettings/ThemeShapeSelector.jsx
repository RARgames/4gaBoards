import React, { useCallback } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../../Utils';

import * as s from './ThemeShapeSelector.module.scss';

const ThemeShapeSelector = React.memo(({ value, options, onChange }) => {
  const handleThemeChange = useCallback(
    (theme) => {
      onChange(theme);
    },
    [onChange],
  );

  return (
    <div className={s.themeButtons}>
      {options.map((option) => (
        <Button key={option.id} style={ButtonStyle.DefaultBorder} className={clsx(s.themeButton, value.id === option.id && s.themeButtonActive)} onClick={() => handleThemeChange(option)} title={option.name}>
          <div className={s.themePreview}>
            <div className={clsx(s.previewBox, option.id === 'rounded' && s.previewBoxRounded)} />
            <span className={s.themeName}>{option.name}</span>
          </div>
        </Button>
      ))}
    </div>
  );
});

ThemeShapeSelector.propTypes = {
  value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func,
};

ThemeShapeSelector.defaultProps = {
  options: [],
  onChange: () => {},
};

export default ThemeShapeSelector;
