import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import CardMoveStep from '../CardMoveStep';
import DeleteStep from '../DeleteStep';
import DueDateEditStep from '../DueDateEditStep';
import LabelsStep from '../LabelsStep';
import MembershipsStep from '../MembershipsStep';
import TimerEditStep from '../TimerEditStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './ActionsPopup.module.scss';

const StepTypes = {
  USERS: 'USERS',
  LABELS: 'LABELS',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_TIMER: 'EDIT_TIMER',
  MOVE: 'MOVE',
  DELETE: 'DELETE',
  ACTIVITY: 'ACTIVITY',
};

const ActionsStep = React.memo(
  ({
    card,
    projectsToLists,
    allBoardMemberships,
    boardMemberships,
    currentUserIds,
    labels,
    currentLabelIds,
    url,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    onNameEdit,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
    onActivitiesFetch,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditNameClick = useCallback(() => {
      onNameEdit();
    }, [onNameEdit]);

    const handleUsersClick = useCallback(() => {
      openStep(StepTypes.USERS);
    }, [openStep]);

    const handleLabelsClick = useCallback(() => {
      openStep(StepTypes.LABELS);
    }, [openStep]);

    const handleEditDueDateClick = useCallback(() => {
      openStep(StepTypes.EDIT_DUE_DATE);
    }, [openStep]);

    const handleEditTimerClick = useCallback(() => {
      openStep(StepTypes.EDIT_TIMER);
    }, [openStep]);

    const handleMoveClick = useCallback(() => {
      openStep(StepTypes.MOVE);
    }, [openStep]);

    const handleActivityClick = useCallback(() => {
      openStep(StepTypes.ACTIVITY);
    }, [openStep]);

    const handleDuplicateClick = useCallback(() => {
      onDuplicate();
      onClose();
    }, [onClose, onDuplicate]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleDueDateUpdate = useCallback(
      (dueDate) => {
        onUpdate({
          dueDate,
        });
      },
      [onUpdate],
    );

    const handleCopyLink = useCallback(() => {
      navigator.clipboard.writeText(url);
      onClose();
    }, [onClose, url]);

    const handleTimerUpdate = useCallback(
      (timer) => {
        onUpdate({
          timer,
        });
      },
      [onUpdate],
    );

    const handleDelete = useCallback(() => {
      onDelete();
      onClose();
    }, [onClose, onDelete]);

    if (step) {
      switch (step.type) {
        case StepTypes.USERS:
          return <MembershipsStep items={allBoardMemberships} currentUserIds={currentUserIds} memberships={boardMemberships} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} onBack={handleBack} />;
        case StepTypes.LABELS:
          return (
            <LabelsStep
              items={labels}
              currentIds={currentLabelIds}
              onSelect={onLabelAdd}
              onDeselect={onLabelRemove}
              onCreate={onLabelCreate}
              onUpdate={onLabelUpdate}
              onDelete={onLabelDelete}
              canEdit={canEdit}
              onBack={handleBack}
            />
          );
        case StepTypes.EDIT_DUE_DATE:
          return <DueDateEditStep defaultValue={card.dueDate} onUpdate={handleDueDateUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.EDIT_TIMER:
          return <TimerEditStep defaultValue={card.timer} onUpdate={handleTimerUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.MOVE:
          return (
            <CardMoveStep
              projectsToLists={projectsToLists}
              defaultPath={pick(card, ['projectId', 'boardId', 'listId'])}
              onMove={onMove}
              onTransfer={onTransfer}
              onBoardFetch={onBoardFetch}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteCard', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisCard')}
              buttonContent={t('action.deleteCard')}
              onConfirm={handleDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name: card.name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={boardMemberships}
              isNotMemberTitle={t('common.noLongerBoardMember')}
              cardId={card.id}
              cardName={card.name}
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
        <Button style={ButtonStyle.PopupContext} content={t('action.editName', { context: 'title' })} onClick={handleEditNameClick} />
        <Button style={ButtonStyle.PopupContext} content={t('common.editMembers', { context: 'title' })} onClick={handleUsersClick} />
        <Button style={ButtonStyle.PopupContext} content={t('common.editLabels', { context: 'title' })} onClick={handleLabelsClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editDueDate', { context: 'title' })} onClick={handleEditDueDateClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editTimer', { context: 'title' })} onClick={handleEditTimerClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.moveCard', { context: 'title' })} onClick={handleMoveClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.duplicateCard', { context: 'title' })} onClick={handleDuplicateClick} />
        <Button style={ButtonStyle.PopupContext} content={t('common.linkCard', { context: 'title' })} onClick={handleCopyLink} />
        <Button style={ButtonStyle.PopupContext} content={t('common.checkActivity', { context: 'title' })} onClick={handleActivityClick} />
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} title={t('action.deleteCard', { context: 'title' })} onClick={handleDeleteClick}>
          <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
          {t('action.deleteCard', { context: 'title' })}
        </Button>
      </>
    );
  },
);

ActionsStep.propTypes = {
  card: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  projectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentLabelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  url: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default withPopup(ActionsStep);
