import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../../hooks';
import { ActivityStep } from '../../ActivityPopup';
import DeleteStep from '../../DeleteStep';
import { Button, ButtonVariant, Icon, IconType, IconSize, Popup, withPopup } from '../../Utils';

import * as s from './CommentActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
};

const CommentActionsStep = React.memo(
  ({
    userName,
    text,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
    onEdit,
    onDelete,
    onActivitiesFetch,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditClick = useCallback(() => {
      onEdit();
      onClose();
    }, [onEdit, onClose]);

    const handleCopyTextClick = useCallback(() => {
      navigator.clipboard.writeText(text);
      onClose();
    }, [text, onClose]);

    const handleActivityClick = useCallback(() => {
      openStep(StepTypes.ACTIVITY);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleDelete = useCallback(() => {
      onDelete();
      onClose();
    }, [onDelete, onClose]);

    if (step) {
      switch (step.type) {
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteComment', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisComment')}
              buttonContent={t('common.deleteComment')}
              onConfirm={handleDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityForComment', { name: userName })}
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
              hideCardDetails
              onFetch={onActivitiesFetch}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        default:
      }
    }

    return (
      <>
        {canEdit && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.editComment', { context: 'title' })} onClick={handleEditClick}>
            <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
            {t('common.editComment', { context: 'title' })}
          </Button>
        )}
        <Button variant={ButtonVariant.PopupContext} title={t('common.copyComment', { context: 'title' })} onClick={handleCopyTextClick}>
          <Icon type={IconType.Copy} size={IconSize.Size13} className={s.icon} />
          {t('common.copyComment', { context: 'title' })}
        </Button>
        <Button variant={ButtonVariant.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        {canEdit && <Popup.Separator />}
        {canEdit && (
          <Button variant={ButtonVariant.PopupContext} title={t('common.deleteComment', { context: 'title' })} onClick={handleDeleteClick}>
            <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
            {t('common.deleteComment', { context: 'title' })}
          </Button>
        )}
      </>
    );
  },
);

CommentActionsStep.propTypes = {
  userName: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CommentActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  lastActivityId: undefined,
};

export default withPopup(CommentActionsStep);
