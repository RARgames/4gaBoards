import React from 'react';
import { useTranslation } from 'react-i18next';
import Config from '../../../constants/Config';
import ExternalLink from '../../Utils/ExternalLink';
import { Icon, IconType, IconSize } from '../../Utils/Icon';

import logo from '../../../assets/images/4gaboardsLogo1024w-white.png';

import styles from './AboutSettings.module.scss';

const AboutSettings = React.memo(() => {
  const [t] = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.headerText}>{t('common.about')}</h2>
      </div>
      <div className={styles.contentWrapper}>
        <img src={logo} className={styles.logo} alt="4ga Boards" />
        <div className={styles.version}>
          {t('common.version')} {Config.VERSION}
        </div>
        <div className={styles.links}>
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
        </div>
      </div>
    </div>
  );
});

AboutSettings.propTypes = {};

export default AboutSettings;
