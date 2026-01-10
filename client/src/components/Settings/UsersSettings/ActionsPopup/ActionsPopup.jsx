import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import { useSteps } from '../../../../hooks';
import { ActivityStep } from '../../../ActivityPopup';
import DeleteStep from '../../../DeleteStep';
import UserEmailEditStep from '../../../UserEmailEditStep';
import UserInformationEditStep from '../../../UserInformationEditStep';
import UserPasswordEditStep from '../../../UserPasswordEditStep';
import UserUsernameEditStep from '../../../UserUsernameEditStep';
import { Popup, withPopup, Button, ButtonStyle } from '../../../Utils';

const StepTypes = {
  EDIT_INFORMATION: 'EDIT_INFORMATION',
  EDIT_USERNAME: 'EDIT_USERNAME',
  EDIT_EMAIL: 'EDIT_EMAIL',
  EDIT_PASSWORD: 'EDIT_PASSWORD',
  DELETE: 'DELETE',
  USER_ACTIVITY: 'USER_ACTIVITY',
  USER_ACCOUNT_ACTIVITY: 'USER_ACCOUNT_ACTIVITY',
};

const ActionsStep = React.memo(
  ({
    isCurrentUser,
    user,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    onUpdate,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onDelete,
    onUserActivitiesFetch,
    onUserAccountActivitiesFetch,
    onClose,
  }) => {
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

    const handleUserActivityClick = useCallback(() => {
      openStep(StepTypes.USER_ACTIVITY);
    }, [openStep]);

    const handleUserAccountActivityClick = useCallback(() => {
      openStep(StepTypes.USER_ACCOUNT_ACTIVITY);
    }, [openStep]);

    const handleDelete = useCallback(() => {
      onDelete();
      onClose();
    }, [onClose, onDelete]);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_INFORMATION:
          return <UserInformationEditStep defaultData={pick(user, ['name', 'phone', 'organization'])} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.EDIT_USERNAME:
          return (
            <UserUsernameEditStep
              usePasswordConfirmation={isCurrentUser}
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
              usePasswordConfirmation={isCurrentUser}
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
              usePasswordConfirmation={isCurrentUser}
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
              onConfirm={handleDelete}
              onBack={handleBack}
            />
          );
        case StepTypes.USER_ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityBy', { name: user.name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              activities={user.activities}
              isFetching={user.isUserActivitiesFetching}
              isAllFetched={user.isAllUserActivitiesFetched}
              lastActivityId={user.lastUserActivityId}
              onFetch={() => onUserActivitiesFetch(user.id)}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.USER_ACCOUNT_ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name: user.name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              activities={user.userAccountActivities}
              isFetching={user.isUserAccountActivitiesFetching}
              isAllFetched={user.isAllUserAccountActivitiesFetched}
              lastActivityId={user.lastUserAccountActivityId}
              onFetch={() => onUserAccountActivitiesFetch(user.id)}
              onBack={handleBack}
              onClose={onClose}
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
        <Button style={ButtonStyle.PopupContext} content={t('common.checkActivity', { context: 'title' })} onClick={handleUserActivityClick} />
        <Button style={ButtonStyle.PopupContext} content={t('common.checkUserAccountActivity', { context: 'title' })} onClick={handleUserAccountActivityClick} />
        {!isCurrentUser && <Popup.Separator />}
        {!isCurrentUser && <Button style={ButtonStyle.PopupContext} content={t('action.deleteUser', { context: 'title' })} onClick={handleDeleteClick} />}
      </>
    );
  },
);

ActionsStep.propTypes = {
  isCurrentUser: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserActivitiesFetch: PropTypes.func.isRequired,
  onUserAccountActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default withPopup(ActionsStep);
