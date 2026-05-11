import React from 'react';
import PropTypes from 'prop-types';

import User from '../../User';
import { Button, Icon, IconType, IconSize } from '../../Utils';

import * as s from './UserItem.module.scss';

const UserItem = React.memo(({ name, avatarUrl, isActive, onSelect }) => (
  <Button onClick={onSelect} className={s.menuItem}>
    <User name={name} avatarUrl={avatarUrl} />
    <div className={s.menuItemText} title={name}>
      {name}
    </div>
    {isActive && <Icon type={IconType.Check} size={IconSize.Size14} />}
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
