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
    <MembershipsPopup
      key={user.id}
      items={allBoardMemberships}
      currentUserIds={userIds}
      onUserSelect={(userId) => onUserAdd(userId, id)}
      onUserDeselect={(userId) => onUserRemove(userId, id)}
      offset={0}
      disabled={!canEdit}
      wrapperClassName={s.userWrapper}
    >
      <User
        name={user.name}
        avatarUrl={user.avatarUrl}
        size="card"
        isMember={!!allBoardMemberships.find((m) => m.user?.id === user.id)?.user?.isBoardMember}
        isNotMemberTitle={t('common.noLongerBoardMember')}
      />
    </MembershipsPopup>
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

  if (users.length === 0 && canEdit) {
    return addUserNode;
  }

  return <div className={classNames(cellClassName)}>{usersNode}</div>;
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
