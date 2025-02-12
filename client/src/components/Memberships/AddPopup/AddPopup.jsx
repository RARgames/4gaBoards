import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useField, useSteps } from '../../../hooks';
import { Popup, Input, InputStyle, withPopup } from '../../Utils';
import UserItem from './UserItem';

import * as gStyles from '../../../globalStyles.module.scss';
import * as s from './AddPopup.module.scss';

const StepTypes = {
  SELECT_PERMISSIONS: 'SELECT_PERMISSIONS',
};

const AddStep = React.memo(({ users, currentUserIds, permissionsSelectStep, title, onCreate, onClose }) => {
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
    },
    [permissionsSelectStep, onCreate, onClose, openStep],
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
    searchField.current.focus({
      preventScroll: true,
    });
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
      default:
    }
  }

  return (
    <>
      <Popup.Header>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Input ref={searchField} style={InputStyle.Default} value={search} placeholder={t('common.searchUsers')} onChange={handleSearchChange} />
        {filteredUsers.length > 0 && (
          <div className={classNames(s.users, gStyles.scrollableY)}>
            {filteredUsers.map((user) => (
              <UserItem key={user.id} name={user.name} avatarUrl={user.avatarUrl} isActive={currentUserIds.includes(user.id)} onSelect={() => handleUserSelect(user.id)} />
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  permissionsSelectStep: PropTypes.elementType,
  title: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddStep.defaultProps = {
  permissionsSelectStep: undefined,
  title: 'common.addMember',
};

export default withPopup(AddStep);
