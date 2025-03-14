import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import User from '../User';
import { Button } from '../Utils';

import * as s from './Item.module.scss';

const Item = React.memo(({ isPersisted, isActive, user, onUserSelect, onUserDeselect }) => {
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
        <User name={user.name} avatarUrl={user.avatarUrl} />
      </span>
      <div className={classNames(s.menuItemText, isActive && s.menuItemTextActive)}>{user.name}</div>
    </Button>
  );
});

Item.propTypes = {
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
};

export default Item;
