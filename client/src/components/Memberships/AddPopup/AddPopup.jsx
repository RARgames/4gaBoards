import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useField, useSteps } from '../../../hooks';
import { Popup, Input, InputStyle, withPopup } from '../../Utils';
import ActionsStep from '../ActionsStep';
import UserItem from './UserItem';

import * as gs from '../../../global.module.scss';
import * as s from './AddPopup.module.scss';

const StepTypes = {
  SELECT_PERMISSIONS: 'SELECT_PERMISSIONS',
  ACTIONS: 'ACTIONS',
};

const AddStep = React.memo(
  ({
    memberships,
    users,
    currentUserIds,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeaveIfLast,
    permissionsSelectStep,
    title,
    onCreate,
    onUpdate,
    onDelete,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();
    const [search, handleSearchChange] = useField('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
    const [sortedUsers, setSortedUsers] = useState([]);

    const sortUsers = useCallback(() => {
      setSortedUsers(
        [...users].sort((a, b) => {
          const aIsActive = currentUserIds.includes(a.id);
          const bIsActive = currentUserIds.includes(b.id);
          return bIsActive - aIsActive;
        }),
      );
    }, [users, currentUserIds]);

    useEffect(() => {
      sortUsers();
    }, [sortUsers]);

    const filteredUsers = useMemo(
      () => sortedUsers.filter((user) => user.email.includes(cleanSearch) || user.name.toLowerCase().includes(cleanSearch) || (user.username && user.username.includes(cleanSearch))),
      [sortedUsers, cleanSearch],
    );

    const searchField = useRef(null);

    const handleUserSelect = useCallback(
      (id) => {
        if (!currentUserIds.includes(id)) {
          if (permissionsSelectStep) {
            openStep(StepTypes.SELECT_PERMISSIONS, {
              userId: id,
            });
          } else {
            onCreate({
              userId: id,
            });

            onClose();
          }
        } else {
          openStep(StepTypes.ACTIONS, {
            userId: id,
          });
        }
      },
      [currentUserIds, permissionsSelectStep, openStep, onCreate, onClose],
    );

    const handleRoleSelect = useCallback(
      (data) => {
        onCreate({
          userId: step.params.userId,
          ...data,
        });
      },
      [onCreate, step],
    );

    useEffect(() => {
      searchField.current?.focus({ preventScroll: true });
    }, []);

    if (step) {
      switch (step.type) {
        case StepTypes.SELECT_PERMISSIONS: {
          const currentUser = users.find((user) => user.id === step.params.userId);

          if (currentUser) {
            const PermissionsSelectStep = permissionsSelectStep;

            return <PermissionsSelectStep buttonContent="action.addMember" onSelect={handleRoleSelect} onBack={handleBack} onClose={onClose} />;
          }

          openStep(null);

          break;
        }
        case StepTypes.ACTIONS: {
          const currentUser = users.find((user) => user.id === step.params.userId);
          const membership = memberships.find((m) => m.userId === currentUser.id);

          if (currentUser && membership) {
            return (
              <ActionsStep
                membership={membership}
                permissionsSelectStep={permissionsSelectStep}
                leaveButtonContent={leaveButtonContent}
                leaveConfirmationTitle={leaveConfirmationTitle}
                leaveConfirmationContent={leaveConfirmationContent}
                leaveConfirmationButtonContent={leaveConfirmationButtonContent}
                deleteButtonContent={deleteButtonContent}
                deleteConfirmationTitle={deleteConfirmationTitle}
                deleteConfirmationContent={deleteConfirmationContent}
                deleteConfirmationButtonContent={deleteConfirmationButtonContent}
                canEdit={canEdit}
                canLeave={memberships.length > 1 || canLeaveIfLast}
                onUpdate={(data) => onUpdate(membership.id, data)}
                onDelete={() => onDelete(membership.id)}
                onBack={handleBack}
                onClose={onClose}
              />
            );
          }

          openStep(null);

          break;
        }
        default:
      }
    }

    return (
      <>
        <Popup.Header>{t(title, { context: 'title' })}</Popup.Header>
        <Popup.Content>
          <Input ref={searchField} style={InputStyle.Default} value={search} placeholder={t('common.searchUsers')} onChange={handleSearchChange} />
          {filteredUsers.length > 0 && (
            <div className={classNames(s.users, gs.scrollableY)}>
              {filteredUsers.map((user) => (
                <UserItem key={user.id} name={user.name} avatarUrl={user.avatarUrl} isActive={currentUserIds.includes(user.id)} onSelect={() => handleUserSelect(user.id)} />
              ))}
            </div>
          )}
        </Popup.Content>
      </>
    );
  },
);

AddStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  memberships: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  permissionsSelectStep: PropTypes.elementType,
  title: PropTypes.string,
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  canLeaveIfLast: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddStep.defaultProps = {
  permissionsSelectStep: undefined,
  title: 'common.addMember',
  leaveButtonContent: undefined,
  leaveConfirmationTitle: undefined,
  leaveConfirmationContent: undefined,
  leaveConfirmationButtonContent: undefined,
  deleteButtonContent: undefined,
  deleteConfirmationTitle: undefined,
  deleteConfirmationContent: undefined,
  deleteConfirmationButtonContent: undefined,
  onUpdate: undefined,
};

export default withPopup(AddStep);
