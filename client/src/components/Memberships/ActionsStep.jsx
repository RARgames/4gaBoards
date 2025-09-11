import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({
    membership,
    permissionsSelectStep,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeave,
    onUpdate,
    onDelete,
    onBack,
    onClose,
    onStepChange,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    useEffect(() => {
      onStepChange(step);
    }, [onStepChange, step]);

    const handleEditPermissionsClick = useCallback(() => {
      openStep(StepTypes.EDIT_PERMISSIONS);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleRoleSelect = useCallback(
      (data) => {
        if (onUpdate) {
          onUpdate(data);
        }
      },
      [onUpdate],
    );

    const handleDelete = useCallback(
      (id) => {
        onDelete(id);
        onClose();
      },
      [onClose, onDelete],
    );

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_PERMISSIONS: {
          const PermissionsSelectStep = permissionsSelectStep;

          return (
            <PermissionsSelectStep
              defaultData={pick(membership, ['role', 'canComment'])}
              title="common.editPermissions"
              buttonContent="action.save"
              onSelect={handleRoleSelect}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        }
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t(membership.user.isCurrent ? leaveConfirmationTitle : deleteConfirmationTitle, { context: 'title' })}
              content={t(membership.user.isCurrent ? leaveConfirmationContent : deleteConfirmationContent)}
              buttonContent={t(membership.user.isCurrent ? leaveConfirmationButtonContent : deleteConfirmationButtonContent)}
              onConfirm={handleDelete}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <div className={s.wrapper}>
        {onBack && (
          <Button style={ButtonStyle.Icon} title={t('common.back')} onClick={onBack} className={s.backButton}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size14} />
          </Button>
        )}
        <span className={s.user}>
          <User name={membership.user.name} avatarUrl={membership.user.avatarUrl} size="large" />
        </span>
        <span className={s.content}>
          <div className={s.name} title={membership.user.name}>
            {membership.user.name}
          </div>
          <div className={s.email} title={membership.user.email}>
            {membership.user.email}
          </div>
        </span>
        {permissionsSelectStep && canEdit && <Button style={ButtonStyle.Popup} content={t('action.editPermissions')} onClick={handleEditPermissionsClick} />}
        {membership.user.isCurrent
          ? canLeave && <Button style={ButtonStyle.Popup} content={t(leaveButtonContent)} onClick={handleDeleteClick} />
          : canEdit && <Button style={ButtonStyle.Popup} content={t(deleteButtonContent)} onClick={handleDeleteClick} />}
      </div>
    );
  },
);

ActionsStep.propTypes = {
  membership: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  permissionsSelectStep: PropTypes.elementType,
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  canLeave: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  permissionsSelectStep: undefined,
  leaveButtonContent: 'action.leaveBoard',
  leaveConfirmationTitle: 'common.leaveBoard',
  leaveConfirmationContent: 'common.areYouSureYouWantToLeaveBoard',
  leaveConfirmationButtonContent: 'action.leaveBoard',
  deleteButtonContent: 'action.removeFromBoard',
  deleteConfirmationTitle: 'common.removeMember',
  deleteConfirmationContent: 'common.areYouSureYouWantToRemoveThisMemberFromBoard',
  deleteConfirmationButtonContent: 'action.removeMember',
  onUpdate: undefined,
  onBack: undefined,
};

export default ActionsStep;
