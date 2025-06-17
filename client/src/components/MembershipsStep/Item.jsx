import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import User from '../User';
import { Button } from '../Utils';

import * as s from './Item.module.scss';

const Item = React.memo(({ isPersisted, isActive, user, memberships, onUserSelect, onUserDeselect }) => {
  const [t] = useTranslation();

  const handleToggleClick = useCallback(() => {
    if (isActive) {
      onUserDeselect();
    } else {
      onUserSelect();
    }
  }, [isActive, onUserSelect, onUserDeselect]);

  return (
    <Button onClick={handleToggleClick} disabled={!isPersisted} className={s.menuItem} title={user.name}>
      <span className={s.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} isMember={memberships ? memberships.some((m) => m.user?.id === user.id) : true} isNotMemberTitle={t('common.noLongerBoardMember')} />
      </span>
      <div className={clsx(s.menuItemText, isActive && s.menuItemTextActive)}>{user.name}</div>
    </Button>
  );
});

Item.propTypes = {
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
};

export default Item;
