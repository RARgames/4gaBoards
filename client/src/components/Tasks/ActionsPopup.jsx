import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import DueDateEditStep from '../DueDateEditStep';
import MembershipsStep from '../MembershipsStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './ActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_MEMBERS: 'EDIT_MEMBERS',
};

const ActionsStep = React.memo(({ dueDate, boardMemberships, users, onUpdate, onDuplicate, onNameEdit, onDelete, onUserAdd, onUserRemove, onClose }) => {
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

  if (step) {
    if (step.type === StepTypes.DELETE) {
      return (
        <DeleteStep
          title={t('common.deleteTask', { context: 'title' })}
          content={t('common.areYouSureYouWantToDeleteThisTask')}
          buttonContent={t('action.deleteTask')}
          onConfirm={onDelete}
          onBack={handleBack}
        />
      );
    }
    if (step.type === StepTypes.EDIT_DUE_DATE) {
      return <DueDateEditStep defaultValue={dueDate} onUpdate={handleDueDateUpdate} onBack={handleBack} onClose={onClose} />;
    }
    if (step.type === StepTypes.EDIT_MEMBERS) {
      return <MembershipsStep items={boardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} onBack={handleBack} />;
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
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} title={t('action.deleteTask', { context: 'title' })} onClick={handleDeleteClick}>
        <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
        {t('action.deleteTask', { context: 'title' })}
      </Button>
    </>
  );
});

ActionsStep.propTypes = {
  dueDate: PropTypes.instanceOf(Date),
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  dueDate: undefined,
};

export default withPopup(ActionsStep);
