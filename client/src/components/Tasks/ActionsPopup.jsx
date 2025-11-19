import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import DeleteStep from '../DeleteStep';
import DueDateEditStep from '../DueDateEditStep';
import MembershipsStep from '../MembershipsStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './ActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_MEMBERS: 'EDIT_MEMBERS',
  ACTIVITY: 'ACTIVITY',
};

const ActionsStep = React.memo(
  ({
    cardId,
    cardName,
    name,
    dueDate,
    allBoardMemberships,
    boardMemberships,
    users,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    onUpdate,
    onDuplicate,
    onNameEdit,
    onDelete,
    onUserAdd,
    onUserRemove,
    onActivitiesFetch,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();
    const userIds = users.map((user) => user.id);

    const handleEditNameClick = useCallback(() => {
      onNameEdit();
    }, [onNameEdit]);

    const handleDueDateUpdate = useCallback(
      (newDueDate) => {
        onUpdate(newDueDate);
      },
      [onUpdate],
    );

    const handleDuplicateClick = useCallback(() => {
      onDuplicate();
      onClose();
    }, [onClose, onDuplicate]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleDueDateEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_DUE_DATE);
    }, [openStep]);

    const handleMembersEditClick = useCallback(() => {
      openStep(StepTypes.EDIT_MEMBERS);
    }, [openStep]);

    const handleActivityClick = useCallback(() => {
      openStep(StepTypes.ACTIVITY);
    }, [openStep]);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_DUE_DATE:
          return <DueDateEditStep defaultValue={dueDate} onUpdate={handleDueDateUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.EDIT_MEMBERS:
          return <MembershipsStep items={allBoardMemberships} currentUserIds={userIds} memberships={boardMemberships} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} onBack={handleBack} />;
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteTask', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisTask')}
              buttonContent={t('action.deleteTask')}
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
              cardId={cardId}
              cardName={cardName}
              activities={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              onFetch={onActivitiesFetch}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} title={t('action.editDescription', { context: 'title' })} onClick={handleEditNameClick}>
          <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
          {t('action.editDescription', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t(dueDate ? 'action.editDueDate' : 'common.addDueDate', { context: 'title' })} onClick={handleDueDateEditClick}>
          <Icon type={IconType.Calendar} size={IconSize.Size13} className={s.icon} />
          {t(dueDate ? 'action.editDueDate' : 'common.addDueDate', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t(users.length > 0 ? 'common.editMembers' : 'common.addMembers', { context: 'title' })} onClick={handleMembersEditClick}>
          <Icon type={IconType.Users} size={IconSize.Size13} className={s.icon} />
          {t(users.length > 0 ? 'common.editMembers' : 'common.addMembers', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.duplicateTask', { context: 'title' })} onClick={handleDuplicateClick}>
          <Icon type={IconType.Duplicate} size={IconSize.Size13} className={s.icon} />
          {t('common.duplicateTask', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} title={t('action.deleteTask', { context: 'title' })} onClick={handleDeleteClick}>
          <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
          {t('action.deleteTask', { context: 'title' })}
        </Button>
      </>
    );
  },
);

ActionsStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  cardName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  dueDate: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default withPopup(ActionsStep);
