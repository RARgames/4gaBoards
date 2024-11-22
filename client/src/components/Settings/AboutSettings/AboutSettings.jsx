import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Config from '../../../constants/Config';
import { Icon, IconType, IconSize, ExternalLink, Button, ButtonStyle } from '../../Utils';

import logo from '../../../assets/images/4gaboardsLogo1024w-white.png';

import * as styles from './AboutSettings.module.scss';
import * as sShared from '../SettingsShared.module.scss';

const AboutSettings = React.memo(({ demoMode, onGettingStartedProjectImport }) => {
  const [t] = useTranslation();
  const { i18n } = useTranslation();
  const [latestVersion, setLatestVersion] = useState(t('common.fetching'));
  const [importGettingStartedButtonDisabled, setImportGettingStartedButtonDisabled] = useState(false);

  const fetchLatestVersion = useCallback(async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/RARgames/4gaBoards/main/package.json');
      const data = await response.json();
      setLatestVersion(data.version);
    } catch {
      setLatestVersion(t('common.unableToFetch'));
    }
  }, [t]);

  const handleGettingStartedProjectImportClick = useCallback(() => {
    setImportGettingStartedButtonDisabled(true);
    onGettingStartedProjectImport({ language: i18n.resolvedLanguage }, true);
  }, [i18n.resolvedLanguage, onGettingStartedProjectImport]);

  useEffect(() => {
    fetchLatestVersion();
  }, [fetchLatestVersion]);

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.about')}</h2>
      </div>
      <div>
        <img src={logo} className={styles.logo} alt="4ga Boards" />
        <div className={styles.version}>
          {t('common.version')} {Config.VERSION}
        </div>
        <div className={styles.version}>
          {t('common.latestVersion')} {latestVersion}
        </div>
        {demoMode && <div className={styles.demoMode}>{t('common.demoMode')}</div>}
        <div className={styles.links}>
          <div className={styles.link}>
            <ExternalLink href={i18n && i18n.resolvedLanguage === 'pl' ? 'https://docs.4gaboards.com/pl/home' : 'https://docs.4gaboards.com/en/home'}>{t('common.docs')}</ExternalLink>
          </div>
          <div className={styles.link}>
            <ExternalLink href="https://4gaboards.com">{t('common.website')}</ExternalLink>
          </div>
          <div className={styles.link}>
            <ExternalLink href="https://github.com/RARgames/4gaBoards">
              <Icon type={IconType.Github} size={IconSize.Size13} className={styles.icon} />
              {t('common.github')}
            </ExternalLink>
          </div>
          <div className={styles.link}>
            <ExternalLink href="https://4gaboards.com/privacy-policy">{t('common.privacyPolicy')}</ExternalLink>
          </div>
          <div className={styles.link}>
            <ExternalLink href="https://4gaboards.com/terms-of-service">{t('common.termsOfService')}</ExternalLink>
          </div>
          <Button
            style={ButtonStyle.DefaultBorder}
            content={t('common.importGettingStartedProject')}
            onClick={handleGettingStartedProjectImportClick}
            disabled={importGettingStartedButtonDisabled}
            className={styles.button}
          />
        </div>
      </div>
    </div>
  );
});

AboutSettings.propTypes = {
  demoMode: PropTypes.bool.isRequired,
  onGettingStartedProjectImport: PropTypes.func.isRequired,
};

export default AboutSettings;
