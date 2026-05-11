import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';
import ActionsPopup from '../ActionsPopup';

import * as s from './ActionsCell.module.scss';

const ActionsCell = React.memo(
  ({
    isCurrentUser,
    email,
    username,
    name,
    organization,
    phone,
    isAdmin,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    activities,
    isUserActivitiesFetching,
    isAllUserActivitiesFetched,
    lastUserActivityId,
    userAccountActivities,
    isUserAccountActivitiesFetching,
    isAllUserAccountActivitiesFetched,
    lastUserAccountActivityId,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
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
  }) => {
    const [t] = useTranslation();

    return (
      <ActionsPopup
        isCurrentUser={isCurrentUser}
        user={{
          email,
          username,
          name,
          organization,
          phone,
          isAdmin,
          emailUpdateForm,
          passwordUpdateForm,
          usernameUpdateForm,
          activities,
          isUserActivitiesFetching,
          isAllUserActivitiesFetched,
          lastUserActivityId,
          userAccountActivities,
          isUserAccountActivitiesFetching,
          isAllUserAccountActivitiesFetched,
          lastUserAccountActivityId,
        }}
        createdAt={createdAt}
        createdBy={createdBy}
        updatedAt={updatedAt}
        updatedBy={updatedBy}
        onUpdate={onUpdate}
        onUsernameUpdate={onUsernameUpdate}
        onUsernameUpdateMessageDismiss={onUsernameUpdateMessageDismiss}
        onEmailUpdate={onEmailUpdate}
        onEmailUpdateMessageDismiss={onEmailUpdateMessageDismiss}
        onPasswordUpdate={onPasswordUpdate}
        onPasswordUpdateMessageDismiss={onPasswordUpdateMessageDismiss}
        onDelete={onDelete}
        onUserActivitiesFetch={onUserActivitiesFetch}
        onUserAccountActivitiesFetch={onUserAccountActivitiesFetch}
        aria-label={t('common.editUser')}
        position="left-start"
        offset={0}
        hideCloseButton
        wrapperClassName={s.popupWrapper}
      >
        <Button style={ButtonStyle.Icon} title={t('common.editUser')} className={s.editButton}>
          <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.iconEditButton} />
        </Button>
      </ActionsPopup>
    );
  },
);

ActionsCell.propTypes = {
  isCurrentUser: PropTypes.bool.isRequired,
  email: PropTypes.string.isRequired,
  username: PropTypes.string,
  name: PropTypes.string.isRequired,
  organization: PropTypes.string,
  phone: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isUserActivitiesFetching: PropTypes.bool.isRequired,
  isAllUserActivitiesFetched: PropTypes.bool.isRequired,
  lastUserActivityId: PropTypes.string,
  userAccountActivities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isUserAccountActivitiesFetching: PropTypes.bool.isRequired,
  isAllUserAccountActivitiesFetched: PropTypes.bool.isRequired,
  lastUserAccountActivityId: PropTypes.string,
  emailUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  passwordUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  usernameUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
};

ActionsCell.defaultProps = {
  username: undefined,
  organization: undefined,
  phone: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  lastUserActivityId: undefined,
  lastUserAccountActivityId: undefined,
};

export default ActionsCell;
