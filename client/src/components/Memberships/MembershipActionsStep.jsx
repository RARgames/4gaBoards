import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import User from '../User';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';

import * as s from './MembershipActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};

const MembershipActionsStep = React.memo(
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
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

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
              buttonContent="common.save"
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
          <Button variant={ButtonVariant.Icon} title={t('common.back')} onClick={onBack} className={s.backButton}>
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
          <div className={s.details}>
            {membership.user.username && (
              <span className={s.detailsData} title={membership.user.username}>
                {membership.user.username}
              </span>
            )}
            {membership.user.email && (
              <span className={s.detailsData} title={membership.user.email}>
                {membership.user.email}
              </span>
            )}
          </div>
        </span>
        {permissionsSelectStep && canEdit && <Button variant={ButtonVariant.Popup} content={t('common.editPermissions')} onClick={handleEditPermissionsClick} />}
        {membership.user.isCurrent
          ? canLeave && <Button variant={ButtonVariant.Popup} content={t(leaveButtonContent)} onClick={handleDeleteClick} />
          : canEdit && <Button variant={ButtonVariant.Popup} content={t(deleteButtonContent)} onClick={handleDeleteClick} />}
      </div>
    );
  },
);

MembershipActionsStep.propTypes = {
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
};

MembershipActionsStep.defaultProps = {
  permissionsSelectStep: undefined,
  leaveButtonContent: 'common.leaveBoard',
  leaveConfirmationTitle: 'common.leaveBoard',
  leaveConfirmationContent: 'common.areYouSureYouWantToLeaveBoard',
  leaveConfirmationButtonContent: 'common.leaveBoard',
  deleteButtonContent: 'common.removeFromBoard',
  deleteConfirmationTitle: 'common.removeMember',
  deleteConfirmationContent: 'common.areYouSureYouWantToRemoveThisMemberFromBoard',
  deleteConfirmationButtonContent: 'common.removeMember',
  onUpdate: undefined,
  onBack: undefined,
};

export default MembershipActionsStep;
