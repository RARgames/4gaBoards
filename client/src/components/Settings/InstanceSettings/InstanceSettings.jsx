import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Radio, RadioSize } from '../../Utils/Radio';

import styles from './InstanceSettings.module.scss';

const InstanceSettings = React.memo(({ registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled, onCoreSettingsUpdate }) => {
  const [t] = useTranslation();

  const handleRegistrationEnabledChange = useCallback(() => {
    onCoreSettingsUpdate({
      registrationEnabled: !registrationEnabled,
    });
  }, [onCoreSettingsUpdate, registrationEnabled]);

  const handleLocalRegistrationEnabledChange = useCallback(() => {
    onCoreSettingsUpdate({
      localRegistrationEnabled: !localRegistrationEnabled,
    });
  }, [localRegistrationEnabled, onCoreSettingsUpdate]);

  const handleSsoRegistrationEnabledChange = useCallback(() => {
    onCoreSettingsUpdate({
      ssoRegistrationEnabled: !ssoRegistrationEnabled,
    });
  }, [onCoreSettingsUpdate, ssoRegistrationEnabled]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.headerText}>{t('common.settings')}</h2>
      </div>
      <div className={styles.settings}>
        <div className={styles.settingsItem}>
          {t('common.enableRegistration')}
          <Radio size={RadioSize.Size12} checked={registrationEnabled} onChange={handleRegistrationEnabledChange} className={styles.radio} />
        </div>
        <div className={styles.settingsItem}>
          {t('common.enableLocalRegistration')}
          <Radio
            size={RadioSize.Size12}
            checked={registrationEnabled && localRegistrationEnabled}
            disabled={!registrationEnabled}
            onChange={handleLocalRegistrationEnabledChange}
            className={styles.radio}
          />
        </div>
        <div className={styles.settingsItem}>
          {t('common.enableSsoRegistration')}
          <Radio
            size={RadioSize.Size12}
            checked={registrationEnabled && ssoRegistrationEnabled}
            disabled={!registrationEnabled}
            onChange={handleSsoRegistrationEnabledChange}
            className={styles.radio}
          />
        </div>
      </div>
    </div>
  );
});

InstanceSettings.propTypes = {
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
  onCoreSettingsUpdate: PropTypes.func.isRequired,
};

export default InstanceSettings;
