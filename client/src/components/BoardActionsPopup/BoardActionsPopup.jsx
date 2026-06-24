import React, { useEffect, useCallback, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import BoardTemplateAddStep from '../BoardTemplateAddStep';
import BoardTemplateManagerStep from '../BoardTemplateManagerStep';
import { ConnectionsStep } from '../ConnectionsPopup';
import DeleteStep from '../DeleteStep';
import ExportStep from '../ExportStep';
import MailTokenListStep from '../MailTokenListStep';
import RenameStep from '../RenameStep';
import { Button, ButtonVariant, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './BoardActionsPopup.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  GITHUB: 'GITHUB',
  EXPORT: 'EXPORT',
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
  MAILTOKEN_LIST: 'MAILTOKEN_LIST',
  CREATE_TEMPLATE: 'CREATE_TEMPLATE',
  TEMPLATE_MANAGER: 'TEMPLATE_MANAGER',
};

const BoardActionsStep = React.memo(
  ({
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
    defaultDataRename,
    defaultDataGithub,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    memberships,
    mailTokens,
    mailTokenCount,
    mailServiceAvailable,
    mailServiceInboundEmail,
    boardName,
    templates,
    isAdmin,
    isProjectManager,
    canEdit,
    isFetching,
    boardMembershipId,
    hideCompletedLists,
    onMembershipUpdate,
    onUpdate,
    onExport,
    onFetch,
    onDelete,
    onActivitiesFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
    onTemplateCreate,
    onTemplateUpdate,
    onTemplateDelete,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();
    const shouldOpenTemplateManagerRef = useRef(false);

    useEffect(() => {
      if (isFetching === null) {
        onFetch();
      }
    }, [isFetching, onFetch]);

    const handleTemplateCreate = useCallback(
      (data) => {
        shouldOpenTemplateManagerRef.current = true;
        onTemplateCreate(data);
      },
      [onTemplateCreate],
    );

    const handleTemplateCreateClose = useCallback(() => {
      if (shouldOpenTemplateManagerRef.current) {
        shouldOpenTemplateManagerRef.current = false;
        openStep(StepTypes.TEMPLATE_MANAGER);

        return;
      }

      onClose();
    }, [onClose, openStep]);

    const handleTemplateUpdate = useCallback(
      (id, data) => {
        onTemplateUpdate(id, data);
      },
      [onTemplateUpdate],
    );

    const handleTemplateDelete = useCallback(
      (id) => {
        onTemplateDelete(id);
      },
      [onTemplateDelete],
    );

    const handleToggleHideCompletedClick = useCallback(() => {
      onMembershipUpdate(boardMembershipId, {
        hideCompletedLists: !hideCompletedLists,
      });
    }, [boardMembershipId, hideCompletedLists, onMembershipUpdate]);

    if (step) {
      switch (step.type) {
        case StepTypes.RENAME:
          return (
            <RenameStep
              title={t('common.renameBoard', { context: 'title' })}
              defaultData={defaultDataRename}
              placeholder={t('common.enterBoardName')}
              onUpdate={onUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.GITHUB:
          return <ConnectionsStep defaultData={defaultDataGithub} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.EXPORT:
          return <ExportStep title={t('common.exportBoard', { context: 'title' })} onExport={onExport} onBack={handleBack} onClose={onClose} />;
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteBoard', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisBoard')}
              buttonContent={t('common.deleteBoard', { context: 'title' })}
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name: defaultDataRename.name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={memberships}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              activities={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              lastActivityId={lastActivityId}
              hideBoardDetails
              onFetch={onActivitiesFetch}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.MAILTOKEN_LIST:
          return (
            <MailTokenListStep
              title={
                <Trans
                  i18nKey="common.emailCardToBoard_withCount"
                  values={{
                    count: mailTokenCount,
                  }}
                  components={{ count: <span className={s.count} /> }}
                />
              }
              mailTokens={mailTokens}
              mailServiceInboundEmail={mailServiceInboundEmail}
              canEdit={canEdit}
              onCreate={onMailTokenCreate}
              onUpdate={onMailTokenUpdate}
              onDelete={onMailTokenDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.CREATE_TEMPLATE:
          return (
            <BoardTemplateAddStep
              title={t('common.convertToTemplate', { context: 'title' })}
              defaultData={{ name: boardName }}
              placeholder={t('common.enterTemplateName')}
              onUpdate={handleTemplateCreate}
              onBack={handleBack}
              onClose={handleTemplateCreateClose}
            />
          );
        case StepTypes.TEMPLATE_MANAGER:
          return <BoardTemplateManagerStep templates={templates} isAdmin={isAdmin} onUpdate={handleTemplateUpdate} onDelete={handleTemplateDelete} onBack={handleBack} />;
        default:
      }
    }

    return (
      <>
        {isProjectManager && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.renameBoard', { context: 'title' })} onClick={() => openStep(StepTypes.RENAME)}>
            <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
            {t('common.renameBoard', { context: 'title' })}
          </Button>
        )}
        {isProjectManager && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.connections', { context: 'title' })} onClick={() => openStep(StepTypes.GITHUB)}>
            <Icon type={IconType.GitHub} size={IconSize.Size13} className={s.icon} />
            {t('common.connections', { context: 'title' })}
          </Button>
        )}
        {isProjectManager && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.exportBoard', { context: 'title' })} onClick={() => openStep(StepTypes.EXPORT)}>
            <Icon type={IconType.Board} size={IconSize.Size13} className={s.icon} />
            {t('common.exportBoard', { context: 'title' })}
          </Button>
        )}
        <Button variant={ButtonVariant.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={() => openStep(StepTypes.ACTIVITY)}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        <Button variant={ButtonVariant.PopupContext} title={hideCompletedLists ? t('common.showCompletedLists') : t('common.hideCompletedLists')} onClick={handleToggleHideCompletedClick}>
          <Icon type={hideCompletedLists ? IconType.Eye : IconType.EyeSlash} size={IconSize.Size13} className={s.icon} />
          {hideCompletedLists ? t('common.showCompletedLists') : t('common.hideCompletedLists')}
        </Button>
        {canEdit && (
          <Button
            variant={ButtonVariant.PopupContext}
            title={mailServiceAvailable ? t('common.emailCardToBoard') : t('common.emailServiceUnavailable')}
            onClick={() => openStep(StepTypes.MAILTOKEN_LIST)}
            disabled={!mailServiceAvailable}
          >
            <Icon type={IconType.Envelope} size={IconSize.Size13} className={s.icon} />
            {t('common.emailCardToBoard')}
          </Button>
        )}
        {(canEdit || isProjectManager) && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.convertToTemplate', { context: 'title' })} onClick={() => openStep(StepTypes.CREATE_TEMPLATE)}>
            <Icon type={IconType.Plus} size={IconSize.Size13} className={s.icon} />
            {t('common.convertToTemplate', { context: 'title' })}
          </Button>
        )}
        {isProjectManager && <Popup.Separator />}
        {isProjectManager && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.deleteBoard', { context: 'title' })} onClick={() => openStep(StepTypes.DELETE)}>
            <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
            {t('common.deleteBoard', { context: 'title' })}
          </Button>
        )}
      </>
    );
  },
);

BoardActionsStep.propTypes = {
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
  defaultDataRename: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDataGithub: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isProjectManager: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  mailTokens: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailTokenCount: PropTypes.number.isRequired,
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  boardName: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  templates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool,
  boardMembershipId: PropTypes.string.isRequired,
  hideCompletedLists: PropTypes.bool.isRequired,
  onMembershipUpdate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onFetch: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
  onTemplateCreate: PropTypes.func.isRequired,
  onTemplateUpdate: PropTypes.func.isRequired,
  onTemplateDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

BoardActionsStep.defaultProps = {
  lastActivityId: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  isFetching: false,
  onFetch: () => {},
};

export default withPopup(BoardActionsStep);
