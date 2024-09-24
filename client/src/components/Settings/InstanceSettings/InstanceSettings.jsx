import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Radio, RadioSize, Table } from '../../Utils';

// import styles from './InstanceSettings.module.scss';
import sShared from '../SettingsShared.module.scss';
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
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.settings')}</h2>
      </div>
      <Table.Wrapper className={classNames(sShared.contentWrapper, gStyles.scrollableXY)}>
        <Table>
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell>{t('common.instanceSettings')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.modifySettings')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.currentValue')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.description')}</Table.HeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{t('common.enableRegistration')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio size={RadioSize.Size12} checked={registrationEnabled} onChange={handleRegistrationEnabledChange} />
              </Table.Cell>
              <Table.Cell>{registrationEnabled ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionUserRegistration')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.enableLocalRegistration')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio size={RadioSize.Size12} checked={registrationEnabled && localRegistrationEnabled} disabled={!registrationEnabled} onChange={handleLocalRegistrationEnabledChange} />
              </Table.Cell>
              <Table.Cell>{registrationEnabled && localRegistrationEnabled ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionLocalRegistration')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.enableSsoRegistration')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio size={RadioSize.Size12} checked={registrationEnabled && ssoRegistrationEnabled} disabled={!registrationEnabled} onChange={handleSsoRegistrationEnabledChange} />
              </Table.Cell>
              <Table.Cell>{registrationEnabled && ssoRegistrationEnabled ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionSsoRegistration')}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Table.Wrapper>
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
