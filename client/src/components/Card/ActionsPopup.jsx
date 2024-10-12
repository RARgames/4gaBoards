import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import { useSteps } from '../../hooks';
import MembershipsStep from '../MembershipsStep';
import LabelsStep from '../LabelsStep';
import DueDateEditStep from '../DueDateEditStep';
import TimerEditStep from '../TimerEditStep';
import CardMoveStep from '../CardMoveStep';
import DeleteStep from '../DeleteStep';

import styles from './ActionsPopup.module.scss';

const StepTypes = {
  USERS: 'USERS',
  LABELS: 'LABELS',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_TIMER: 'EDIT_TIMER',
  MOVE: 'MOVE',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({
    card,
    projectsToLists,
    boardMemberships,
    currentUserIds,
    labels,
    currentLabelIds,
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
    onLabelMove,
    onLabelDelete,
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

    const handleTimerUpdate = useCallback(
      (timer) => {
        onUpdate({
          timer,
        });
      },
      [onUpdate],
    );

    if (step) {
      switch (step.type) {
        case StepTypes.USERS:
          return <MembershipsStep items={boardMemberships} currentUserIds={currentUserIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} onBack={handleBack} />;
        case StepTypes.LABELS:
          return (
            <LabelsStep
              items={labels}
              currentIds={currentLabelIds}
              onSelect={onLabelAdd}
              onDeselect={onLabelRemove}
              onCreate={onLabelCreate}
              onUpdate={onLabelUpdate}
              onMove={onLabelMove}
              onDelete={onLabelDelete}
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
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} content={t('action.editTitle', { context: 'title' })} onClick={handleEditNameClick} />
        <Button style={ButtonStyle.PopupContext} content={t('common.editMembers', { context: 'title' })} onClick={handleUsersClick} />
        <Button style={ButtonStyle.PopupContext} content={t('common.editLabels', { context: 'title' })} onClick={handleLabelsClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editDueDate', { context: 'title' })} onClick={handleEditDueDateClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editTimer', { context: 'title' })} onClick={handleEditTimerClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.moveCard', { context: 'title' })} onClick={handleMoveClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.duplicateCard', { context: 'title' })} onClick={handleDuplicateClick} />
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} title={t('action.deleteCard', { context: 'title' })} onClick={handleDeleteClick}>
          <Icon type={IconType.Trash} size={IconSize.Size13} className={styles.icon} />
          {t('action.deleteCard', { context: 'title' })}
        </Button>
      </>
    );
  },
);

ActionsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  card: PropTypes.object.isRequired,
  projectsToLists: PropTypes.array.isRequired,
  boardMemberships: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  currentLabelIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
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
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
