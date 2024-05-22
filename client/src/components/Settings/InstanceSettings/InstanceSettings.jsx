import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Radio, RadioSize } from '../../Utils/Radio';

import styles from './InstanceSettings.module.scss';
import gStyles from '../../../globalStyles.module.scss';

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
      <div className={classNames(styles.tableWrapper, gStyles.scrollableXY)}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeaderCell}>{t('common.settingsInstance')}</th>
              <th className={styles.tableHeaderCell}>{t('common.modifySettings')}</th>
              <th className={styles.tableHeaderCell}>{t('common.currentValue')}</th>
              <th className={styles.tableHeaderCell}>{t('common.description')}</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            <tr className={styles.tableBodyRow}>
              <td className={styles.tableCell}>{t('common.enableRegistration')}</td>
              <td className={styles.tableCell} aria-label={t('common.toggleRegistration')}>
                <Radio size={RadioSize.Size12} checked={registrationEnabled} onChange={handleRegistrationEnabledChange} />
              </td>
              <td className={styles.tableCell}>{registrationEnabled ? t('common.enabled') : t('common.disabled')}</td>
              <td className={styles.tableCell}>{t('common.descriptionUserRegistration')}</td>
            </tr>
            <tr className={styles.tableBodyRow}>
              <td className={styles.tableCell}>{t('common.enableLocalRegistration')}</td>
              <td className={styles.tableCell} aria-label={t('common.toggleRegistration')}>
                <Radio size={RadioSize.Size12} checked={registrationEnabled && localRegistrationEnabled} disabled={!registrationEnabled} onChange={handleLocalRegistrationEnabledChange} />
              </td>
              <td className={styles.tableCell}>{registrationEnabled && localRegistrationEnabled ? t('common.enabled') : t('common.disabled')}</td>
              <td className={styles.tableCell}>{t('common.descriptionLocalRegistration')}</td>
            </tr>
            <tr className={styles.tableBodyRow}>
              <td className={styles.tableCell}>{t('common.enableSsoRegistration')}</td>
              <td className={styles.tableCell} aria-label={t('common.toggleRegistration')}>
                <Radio size={RadioSize.Size12} checked={registrationEnabled && ssoRegistrationEnabled} disabled={!registrationEnabled} onChange={handleSsoRegistrationEnabledChange} />
              </td>
              <td className={styles.tableCell}>{registrationEnabled && ssoRegistrationEnabled ? t('common.enabled') : t('common.disabled')}</td>
              <td className={styles.tableCell}>{t('common.descriptionSsoRegistration')}</td>
            </tr>
          </tbody>
        </table>
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
