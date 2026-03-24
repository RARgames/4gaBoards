import React, { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import DeleteStep from '../DeleteStep';
import MailTokenListStep from '../MailTokenListStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './ListActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
  MAILTOKEN_LIST: 'MAILTOKEN_LIST',
};

const ListActionsStep = React.memo(
  ({
    name,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
    mailTokens,
    mailTokenCount,
    mailServiceAvailable,
    mailServiceInboundEmail,
    canEdit,
    onNameEdit,
    onCardAdd,
    onActivitiesFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
    onDelete,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditNameClick = useCallback(() => {
      onNameEdit();
      onClose();
    }, [onNameEdit, onClose]);

    const handleAddCardClick = useCallback(() => {
      onCardAdd();
      onClose();
    }, [onCardAdd, onClose]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleActivityClick = useCallback(() => {
      openStep(StepTypes.ACTIVITY);
    }, [openStep]);

    const handleMailTokenListClick = useCallback(() => {
      openStep(StepTypes.MAILTOKEN_LIST);
    }, [openStep]);

    if (step) {
      switch (step.type) {
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteList', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisList')}
              buttonContent={t('action.deleteList')}
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={boardMemberships}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              activities={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              lastActivityId={lastActivityId}
              hideListDetails
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
                  i18nKey="common.emailCardToList_withCount"
                  values={{
                    count: mailTokenCount,
                  }}
                >
                  <span className={s.count} />
                </Trans>
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
        default:
      }
    }

    return (
      <>
        {canEdit && (
          <Button style={ButtonStyle.PopupContext} title={t('action.editName', { context: 'title' })} onClick={handleEditNameClick}>
            <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
            {t('action.editName', { context: 'title' })}
          </Button>
        )}
        <Button style={ButtonStyle.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        {canEdit && (
          <Button style={ButtonStyle.PopupContext} title={t('action.addCard', { context: 'title' })} onClick={handleAddCardClick}>
            <Icon type={IconType.Plus} size={IconSize.Size13} className={s.icon} />
            {t('action.addCard', { context: 'title' })}
          </Button>
        )}
        {canEdit && (
          <Button
            style={ButtonStyle.PopupContext}
            title={mailServiceAvailable ? t('common.emailCardToList') : t('common.emailServiceUnavailable')}
            onClick={handleMailTokenListClick}
            disabled={!mailServiceAvailable}
          >
            <Icon type={IconType.Envelope} size={IconSize.Size13} className={s.icon} />
            {t('common.emailCardToList')}
          </Button>
        )}
        {canEdit && <Popup.Separator />}
        {canEdit && (
          <Button style={ButtonStyle.PopupContext} title={t('action.deleteList', { context: 'title' })} onClick={handleDeleteClick}>
            <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
            {t('action.deleteList', { context: 'title' })}
          </Button>
        )}
      </>
    );
  },
);

ListActionsStep.propTypes = {
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
  mailTokens: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailTokenCount: PropTypes.number.isRequired,
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ListActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  lastActivityId: undefined,
};

export default withPopup(ListActionsStep);
