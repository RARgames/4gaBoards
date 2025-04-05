import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Radio, RadioSize, TableLegacy as Table } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';

const InstanceSettings = React.memo(({ registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled, demoMode, onCoreSettingsUpdate }) => {
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
        <div className={sShared.headerFlex}>
          <h2 className={sShared.headerText}>{t('common.settings')}</h2>
        </div>
        {demoMode && <p className={sShared.demoMode}>{t('common.demoModeExplanation')}</p>}
      </div>
      <Table.Wrapper className={classNames(gs.scrollableXY)}>
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
                <Radio size={RadioSize.Size12} checked={registrationEnabled} disabled={demoMode} onChange={handleRegistrationEnabledChange} title={t('common.toggleUserRegistration')} />
              </Table.Cell>
              <Table.Cell>{registrationEnabled ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionUserRegistration')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.enableLocalRegistration')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio
                  size={RadioSize.Size12}
                  checked={registrationEnabled && localRegistrationEnabled}
                  disabled={!registrationEnabled || demoMode}
                  onChange={handleLocalRegistrationEnabledChange}
                  title={t('common.toggleLocalUserRegistration')}
                />
              </Table.Cell>
              <Table.Cell>{registrationEnabled && localRegistrationEnabled ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionLocalRegistration')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.enableSsoRegistration')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio
                  size={RadioSize.Size12}
                  checked={registrationEnabled && ssoRegistrationEnabled}
                  disabled={!registrationEnabled || demoMode}
                  onChange={handleSsoRegistrationEnabledChange}
                  title={t('common.toggleSsoUserRegistration')}
                />
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
  demoMode: PropTypes.bool.isRequired,
  onCoreSettingsUpdate: PropTypes.func.isRequired,
};

export default InstanceSettings;
