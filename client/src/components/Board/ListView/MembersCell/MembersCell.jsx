import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import MembershipsPopup from '../../../MembershipsPopup';
import User from '../../../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './MembersCell.module.scss';

const MembersCell = React.memo(({ id, users, allBoardMemberships, cellClassName, canEdit, onUserAdd, onUserRemove }) => {
  const [t] = useTranslation();
  const userIds = users.map((user) => user.id);

  const usersNode = users.map((user) => (
    <span key={user.id} className={classNames(s.attachment, s.user)}>
      <User name={user.name} avatarUrl={user.avatarUrl} size="card" />
    </span>
  ));

  const addUserNode = (
    <MembershipsPopup
      items={allBoardMemberships}
      currentUserIds={userIds}
      onUserSelect={(userId) => onUserAdd(userId, id)}
      onUserDeselect={(userId) => onUserRemove(userId, id)}
      offset={0}
      wrapperClassName={s.popupWrapper}
    >
      <Button style={ButtonStyle.Icon} title={t('common.addMember')} className={classNames(cellClassName, s.addButton)}>
        <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
      </Button>
    </MembershipsPopup>
  );

  if (!canEdit) {
    return <div className={classNames(cellClassName, s.users)}>{usersNode}</div>;
  }

  if (users.length === 0) {
    return addUserNode;
  }

  return (
    <div className={classNames(cellClassName, s.users)}>
      <MembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={(userId) => onUserAdd(userId, id)} onUserDeselect={(userId) => onUserRemove(userId, id)} offset={0}>
        {usersNode}
      </MembershipsPopup>
    </div>
  );
});

MembersCell.propTypes = {
  id: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
};

MembersCell.defaultProps = {
  cellClassName: '',
};

export default MembersCell;
