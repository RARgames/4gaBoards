import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ApiClientPopup from '../../ApiClientPopup';
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
    apiClientForm,
    apiClients,
    apiClientCount,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onApiClientMessageDismiss,
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
              <ApiClientPopup
                id={apiClients.length > 0 ? apiClients[apiClients.length - 1].clientId : null}
                secret={apiClients.length > 0 ? apiClients[apiClients.length - 1].clientSecret : null}
                defaultData={apiClientForm.data}
                isSubmitting={apiClientForm.isSubmitting}
                error={apiClientForm.error}
                title={t('common.generateApiClient')}
                submitButtonText={t('common.generate')}
                onSubmit={onApiClientCreate}
                onMessageDismiss={onApiClientMessageDismiss}
              >
                <Button style={ButtonStyle.DefaultBorder} content={t('common.generateApiClient')} />
              </ApiClientPopup>
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
                        <span className={s.lastUsed}>
                          {t('common.lastUsed')} {!apiClient.lastUsedAt && t('common.never')}
                        </span>
                        <DateText value={apiClient.lastUsedAt} showTime className={s.createdAt} titlePrefix={t('common.lastUsed')} />
                        <div className={s.itemHeaderButtons}>
                          <ApiClientPopup
                            id={apiClient.clientId}
                            secret={apiClient.clientSecret}
                            defaultData={{ name: apiClient.name, permissions: apiClient.permissions, regenerateSecret: false }}
                            isSubmitting={apiClientForm.isSubmitting}
                            error={apiClientForm.error}
                            title={t('common.editApiClient')}
                            submitButtonText={t('common.save')}
                            isUpdate
                            onSubmit={(data) => onApiClientUpdate(apiClient.id, data)}
                            onMessageDismiss={onApiClientMessageDismiss}
                          >
                            <Button style={ButtonStyle.Icon} title={t('common.editApiClient')}>
                              <Icon type={IconType.Pencil} size={IconSize.Size12} />
                            </Button>
                          </ApiClientPopup>
                          <ShowSecretPopup id={apiClient.clientId} secret={apiClient.clientSecret}>
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
  apiClientForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  apiClients: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  apiClientCount: PropTypes.number.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onApiClientMessageDismiss: PropTypes.func.isRequired,
  onApiClientCreate: PropTypes.func.isRequired,
  onApiClientUpdate: PropTypes.func.isRequired,
  onApiClientDelete: PropTypes.func.isRequired,
};

export default AuthenticationSettings;
