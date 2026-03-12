import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ApiClientCreatePopup from '../../ApiClientCreatePopup';
import DateText from '../../DateText';
import DeletePopup from '../../DeletePopup';
import ShowSecretPopup from '../../ShowSecretStep';
import UserPasswordEditPopup from '../../UserPasswordEditPopup';
import { Button, ButtonStyle, Icon, IconSize, IconType } from '../../Utils';

import * as sShared from '../SettingsShared.module.scss';
import * as s from './AuthenticationSettings.module.scss';

const AuthenticationSettings = React.memo(
  ({
    isPasswordAuthenticated,
    passwordUpdateForm,
    apiClientCreateForm,
    // apiClientUpdateForm,
    apiClients,
    apiClientCount,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onApiClientCreateMessageDismiss,
    // onApiClientUpdateMessageDismiss,
    onApiClientCreate,
    onApiClientUpdate,
    onApiClientDelete,
  }) => {
    const [t] = useTranslation();

    const handleResetClick = useCallback(
      (apiClientId) => {
        onApiClientUpdate(apiClientId, { regenerateSecret: true });
      },
      [onApiClientUpdate],
    );

    const handleCopyClick = useCallback((apiClientSecret) => {
      navigator.clipboard.writeText(apiClientSecret);
    }, []);

    return (
      <div className={sShared.wrapper}>
        <div className={sShared.header}>
          <h2 className={sShared.headerText}>{t('common.authentication')}</h2>
        </div>
        <div>
          <div className={s.actionsWrapper}>
            <div className={s.action}>
              <UserPasswordEditPopup
                usePasswordConfirmation={isPasswordAuthenticated}
                defaultData={passwordUpdateForm.data}
                isSubmitting={passwordUpdateForm.isSubmitting}
                error={passwordUpdateForm.error}
                title={isPasswordAuthenticated ? t('common.editPassword', { context: 'title' }) : t('common.setPassword', { context: 'title' })}
                onUpdate={onPasswordUpdate}
                onMessageDismiss={onPasswordUpdateMessageDismiss}
              >
                <Button style={ButtonStyle.DefaultBorder} content={isPasswordAuthenticated ? t('action.editPassword', { context: 'title' }) : t('common.setPassword', { context: 'title' })} />
              </UserPasswordEditPopup>
            </div>
            <div className={s.action}>
              <ApiClientCreatePopup
                secret={apiClients.length > 0 ? apiClients[apiClients.length - 1].clientSecret : null}
                defaultData={apiClientCreateForm.data}
                isSubmitting={apiClientCreateForm.isSubmitting}
                error={apiClientCreateForm.error}
                title={t('common.generateNewApiClient')}
                onCreate={onApiClientCreate}
                onMessageDismiss={onApiClientCreateMessageDismiss}
              >
                <Button style={ButtonStyle.DefaultBorder} content={t('common.generateNewApiClient')} />
              </ApiClientCreatePopup>
            </div>
            <div className={clsx(s.action)}>
              <div className={s.apiClientsHeader}>
                {t('common.apiClients')}
                <span className={s.apiClientCount}>[{apiClientCount}]</span>
              </div>
              {apiClients.length > 0 ? (
                <div className={s.items}>
                  {apiClients.map((apiClient) => (
                    <div key={apiClient.id} className={s.item}>
                      <div className={s.itemHeader}>
                        {apiClient.name ? apiClient.name : t('common.apiClient')}
                        <DateText
                          value={apiClient.createdAt}
                          showTime
                          className={s.createdAt}
                          title={`${t('common.createdAt_withDate', { date: t(`format:dateTime`, { value: apiClient.createdAt, postProcess: 'formatDate' }) })}\n${apiClient.updatedAt ? t('common.updatedAt_withDate', { date: t(`format:dateTime`, { value: apiClient.updatedAt, postProcess: 'formatDate' }) }) : ''}`}
                        />
                        <div className={s.itemHeaderButtons}>
                          {/* TODO edit apiClient */}
                          {/* <ApiClientUpdatePopup
                            secret={apiClient.clientSecret || t('common.generatingApiClientSecret')}
                            defaultData={apiClientCreateForm.data}
                            isSubmitting={apiClientCreateForm.isSubmitting}
                            error={apiClientCreateForm.error}
                            title={t('common.generateNewApiClient')}
                            onCreate={onApiClientCreate}
                            onMessageDismiss={onApiClientCreateMessageDismiss}
                          >
                            <Button style={ButtonStyle.DefaultBorder} content={t('common.generateNewApiClient')} />
                          </ApiClientUpdatePopup> */}
                          <ShowSecretPopup secret={apiClient.clientSecret || t('common.generatingApiClientSecret')}>
                            <Button style={ButtonStyle.Icon} title={t('common.resetApiClient')} onClick={() => handleResetClick(apiClient.id)}>
                              <Icon type={IconType.Reset} size={IconSize.Size12} />
                            </Button>
                          </ShowSecretPopup>
                          <DeletePopup
                            title={t('common.deleteApiClient', { context: 'title' })}
                            content={t('common.areYouSureYouWantToDeleteThisApiClient')}
                            buttonContent={t('common.deleteApiClient')}
                            onConfirm={() => onApiClientDelete(apiClient.id)}
                            position="left-start"
                            offset={0}
                          >
                            <Button style={ButtonStyle.Icon} title={t('common.deleteApiClient')}>
                              <Icon type={IconType.Trash} size={IconSize.Size12} />
                            </Button>
                          </DeletePopup>
                        </div>
                      </div>
                      <div className={s.itemContent}>
                        <span className={s.dataWrapper}>
                          {t('common.clientId')}: <span className={s.data}>{apiClient.clientId}</span>
                        </span>
                        {apiClient.clientSecret && (
                          <span className={s.dataWrapper}>
                            {t('common.clientSecret')}:
                            {apiClient.clientSecret && (
                              <Button style={ButtonStyle.Icon} title={t('common.copyClientSecret')} onClick={() => handleCopyClick(apiClient.clientSecret)} className={s.copyButton}>
                                <Icon type={IconType.Copy} size={IconSize.Size12} />
                              </Button>
                            )}
                            <span className={s.data}>{apiClient.clientSecret}</span>
                          </span>
                        )}
                        <span className={s.dataWrapper}>
                          {t('common.permissions')}: <span className={s.dataPermissions}>{apiClient.permissions === '*' ? t('common.all') : apiClient.permissions.join(', ')}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={s.noApiClients}>{t('common.noApiClients')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AuthenticationSettings.propTypes = {
  isPasswordAuthenticated: PropTypes.bool.isRequired,
  passwordUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  apiClientCreateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  // apiClientUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  apiClients: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  apiClientCount: PropTypes.number.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onApiClientCreateMessageDismiss: PropTypes.func.isRequired,
  // onApiClientUpdateMessageDismiss: PropTypes.func.isRequired,
  onApiClientCreate: PropTypes.func.isRequired,
  onApiClientUpdate: PropTypes.func.isRequired,
  onApiClientDelete: PropTypes.func.isRequired,
};

export default AuthenticationSettings;
