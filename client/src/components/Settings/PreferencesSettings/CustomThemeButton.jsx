import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import Paths from '../../../constants/Paths';
import { Button, ButtonStyle } from '../../Utils';

import * as s from './CustomThemeButton.module.scss';

const CustomThemeButton = React.memo(() => {
  const [t] = useTranslation();

  return (
    <Link to={Paths.SETTINGS_PREFERENCES_THEME}>
      <Button style={ButtonStyle.DefaultBorder} className={s.themeButton} content={t('common.goToThemeEditor')} />
    </Link>
  );
});

CustomThemeButton.propTypes = {};

export default CustomThemeButton;
