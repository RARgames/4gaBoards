import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Popup, withPopup, Button, ButtonStyle } from '../../../Utils';

import { useSteps } from '../../../../hooks';
import UserInformationEditStep from '../../../UserInformationEditStep';
import UserUsernameEditStep from '../../../UserUsernameEditStep';
import UserEmailEditStep from '../../../UserEmailEditStep';
import UserPasswordEditStep from '../../../UserPasswordEditStep';
import DeleteStep from '../../../DeleteStep';

// import * as styles from './ActionsPopup.module.scss';

const StepTypes = {
  EDIT_INFORMATION: 'EDIT_INFORMATION',
  EDIT_USERNAME: 'EDIT_USERNAME',
  EDIT_EMAIL: 'EDIT_EMAIL',
  EDIT_PASSWORD: 'EDIT_PASSWORD',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({ user, onUpdate, onUsernameUpdate, onUsernameUpdateMessageDismiss, onEmailUpdate, onEmailUpdateMessageDismiss, onPasswordUpdate, onPasswordUpdateMessageDismiss, onDelete, onClose }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleEditInformationClick = useCallback(() => {
      openStep(StepTypes.EDIT_INFORMATION);
    }, [openStep]);

    const handleEditUsernameClick = useCallback(() => {
      openStep(StepTypes.EDIT_USERNAME);
    }, [openStep]);

    const handleEditEmailClick = useCallback(() => {
      openStep(StepTypes.EDIT_EMAIL);
    }, [openStep]);

    const handleEditPasswordClick = useCallback(() => {
      openStep(StepTypes.EDIT_PASSWORD);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_INFORMATION:
          return <UserInformationEditStep defaultData={pick(user, ['name', 'phone', 'organization'])} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.EDIT_USERNAME:
          return (
            <UserUsernameEditStep
              defaultData={user.usernameUpdateForm.data}
              username={user.username}
              isSubmitting={user.usernameUpdateForm.isSubmitting}
              error={user.usernameUpdateForm.error}
              onUpdate={onUsernameUpdate}
              onMessageDismiss={onUsernameUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_EMAIL:
          return (
            <UserEmailEditStep
              defaultData={user.emailUpdateForm.data}
              email={user.email}
              isSubmitting={user.emailUpdateForm.isSubmitting}
              error={user.emailUpdateForm.error}
              onUpdate={onEmailUpdate}
              onMessageDismiss={onEmailUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.EDIT_PASSWORD:
          return (
            <UserPasswordEditStep
              defaultData={user.passwordUpdateForm.data}
              isSubmitting={user.passwordUpdateForm.isSubmitting}
              error={user.passwordUpdateForm.error}
              onUpdate={onPasswordUpdate}
              onMessageDismiss={onPasswordUpdateMessageDismiss}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={t('common.deleteUser', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisUser')}
              buttonContent={t('action.deleteUser')}
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} content={t('action.editInformation', { context: 'title' })} onClick={handleEditInformationClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editUsername', { context: 'title' })} onClick={handleEditUsernameClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editEmail', { context: 'title' })} onClick={handleEditEmailClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.editPassword', { context: 'title' })} onClick={handleEditPasswordClick} />
        <Popup.Separator />
        <Button style={ButtonStyle.PopupContext} content={t('action.deleteUser', { context: 'title' })} onClick={handleDeleteClick} />
      </>
    );
  },
);

ActionsStep.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
