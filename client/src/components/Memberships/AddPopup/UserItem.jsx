import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from '../../Utils';

import User from '../../User';

import styles from './UserItem.module.scss';

const UserItem = React.memo(({ name, avatarUrl, isActive, onSelect }) => (
  <Button onClick={onSelect} disabled={isActive} className={styles.menuItem}>
    <span className={styles.user}>
      <User name={name} avatarUrl={avatarUrl} />
    </span>
    <div className={classNames(styles.menuItemText, isActive && styles.menuItemTextActive)}>{name}</div>
  </Button>
));

UserItem.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

UserItem.defaultProps = {
  avatarUrl: undefined,
};

export default UserItem;
