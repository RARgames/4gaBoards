import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ActionsCell from '../../components/Settings/UsersSettings/ActionsCell';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const makeMapStateToProps = () => {
  const selectUserById = selectors.makeSelectUserById();

  return (state, { id }) => {
    const { email, username, name, organization, phone, isAdmin, emailUpdateForm, passwordUpdateForm, usernameUpdateForm, createdAt, createdBy, updatedAt, updatedBy } = selectUserById(state, id);
    const currentUser = selectors.selectCurrentUser(state);
    const isCurrentUser = currentUser.id === id;

    return {
      isCurrentUser,
      email,
      username,
      name,
      organization,
      phone,
      isAdmin,
      emailUpdateForm,
      passwordUpdateForm,
      usernameUpdateForm,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateUser(id, data),
      onUsernameUpdate: (data) => entryActions.updateUserUsername(id, data),
      onUsernameUpdateMessageDismiss: () => entryActions.clearUserUsernameUpdateError(id),
      onEmailUpdate: (data) => entryActions.updateUserEmail(id, data),
      onEmailUpdateMessageDismiss: () => entryActions.clearUserEmailUpdateError(id),
      onPasswordUpdate: (data) => entryActions.updateUserPassword(id, data),
      onPasswordUpdateMessageDismiss: () => entryActions.clearUserPasswordUpdateError(id),
      onDelete: () => entryActions.deleteUser(id),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(ActionsCell);
