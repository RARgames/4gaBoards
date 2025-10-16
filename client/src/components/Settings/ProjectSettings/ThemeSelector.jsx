import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import useLocalStorage from '../../../hooks/use-local-storage';
import { Button, ButtonStyle } from '../../Utils';

import * as s from './ThemeSelector.module.scss';

const THEMES = {
  DEFAULT: 'default',
  ROUNDED: 'rounded',
};

const ThemeSelector = React.memo(() => {
  const [t] = useTranslation();
  const [setTheme, getTheme] = useLocalStorage('appTheme');

  const [currentTheme, setCurrentTheme] = useState(() => getTheme() || THEMES.DEFAULT);

  const applyTheme = useCallback((theme) => {
    const body = document.getElementById('app');
    if (body) {
      // Remove all theme classes
      body.classList.remove('theme-default', 'theme-rounded');
      // Add the selected theme class
      body.classList.add(`theme-${theme}`);
    }
  }, []);

  const handleThemeChange = useCallback(
    (theme) => {
      setTheme(theme);
      setCurrentTheme(theme);
      applyTheme(theme);
    },
    [setTheme, applyTheme],
  );

  useEffect(() => {
    // Apply theme on mount
    applyTheme(currentTheme);
  }, [applyTheme, currentTheme]);

  return (
    <div className={s.container}>
      <div className={s.themeButtons}>
        <Button style={ButtonStyle.DefaultBorder} className={clsx(s.themeButton, currentTheme === THEMES.DEFAULT && s.themeButtonActive)} onClick={() => handleThemeChange(THEMES.DEFAULT)}>
          <div className={s.themePreview}>
            <div className={s.previewBox} />
            <span className={s.themeName}>{t('common.defaultTheme', { defaultValue: 'Default' })}</span>
          </div>
        </Button>
        <Button style={ButtonStyle.DefaultBorder} className={clsx(s.themeButton, currentTheme === THEMES.ROUNDED && s.themeButtonActive)} onClick={() => handleThemeChange(THEMES.ROUNDED)}>
          <div className={s.themePreview}>
            <div className={clsx(s.previewBox, s.previewBoxRounded)} />
            <span className={s.themeName}>{t('common.roundedTheme', { defaultValue: 'Rounded' })}</span>
          </div>
        </Button>
      </div>
    </div>
  );
});

export default ThemeSelector;
