import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../../../constants/DroppableTypes';
import { dragKey, hideIfPending } from '../../../../lib/hooks/use-drop-animation';
import { useUserDropSlot, useUserDropped, useUserDropTarget } from '../../../../lib/hooks/use-user-drop-slot';
import MembershipsPopup from '../../../MembershipsPopup';
import User from '../../../User';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './MembersCell.module.scss';

const MembersCell = React.memo(({ id, users, boardMemberships, allBoardMemberships, cellClassName, canEdit, onUserAdd, onUserRemove, onUserEmailLookup }) => {
  const [t] = useTranslation();
  const dropTargetRef = useRef(null);
  const droppedUserRef = useRef(null);
  const setDropTargetRef = useCallback((node) => {
    dropTargetRef.current = node?.closest('tr') ?? null;
  }, []);
  const userIds = users.map((user) => user.id);
  const isEmpty = users.length === 0;

  const userDropPlaceholder = useUserDropSlot((slot) => (slot && slot.cardId === id && !slot.taskId && slot.target === DroppableTypes.LISTVIEWCARD ? slot.user : null));
  const droppedUserId = useUserDropped((slot) => (slot && slot.cardId === id && !slot.taskId && slot.target === DroppableTypes.LISTVIEWCARD ? slot.userId : null));

  const assignedUserIds = useMemo(() => users.map((user) => user.id), [users]);
  const handleUserDrop = useCallback((userId) => onUserAdd(userId, id), [onUserAdd, id]);

  useUserDropTarget(dropTargetRef, {
    cardId: id,
    target: DroppableTypes.LISTVIEWCARD,
    enabled: canEdit,
    assignedUserIds,
    onUserDrop: handleUserDrop,
  });

  useLayoutEffect(() => {
    if (droppedUserId) hideIfPending(droppedUserRef.current, dragKey(DroppableTypes.USER, droppedUserId));
  });

  const usersNode = users.map((user) => (
    <MembershipsPopup
      key={user.id}
      items={allBoardMemberships}
      currentUserIds={userIds}
      memberships={boardMemberships}
      onUserSelect={(userId) => onUserAdd(userId, id)}
      onUserDeselect={(userId) => onUserRemove(userId, id)}
      onUserEmailLookup={onUserEmailLookup}
      offset={0}
      disabled={!canEdit}
      wrapperClassName={s.userWrapper}
    >
      <span ref={user.id === droppedUserId ? droppedUserRef : undefined} data-drag-key={user.id === droppedUserId ? dragKey(DroppableTypes.USER, user.id) : undefined}>
        <User name={user.name} avatarUrl={user.avatarUrl} size="card" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
      </span>
    </MembershipsPopup>
  ));

  const addUserNode = (
    <MembershipsPopup
      items={allBoardMemberships}
      currentUserIds={userIds}
      memberships={boardMemberships}
      onUserSelect={(userId) => onUserAdd(userId, id)}
      onUserDeselect={(userId) => onUserRemove(userId, id)}
      onUserEmailLookup={onUserEmailLookup}
      offset={0}
      wrapperClassName={s.popupWrapper}
    >
      <Button variant={ButtonVariant.Icon} title={t('common.addMember')} className={s.addButton}>
        <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
      </Button>
    </MembershipsPopup>
  );

  if (users.length === 0 && canEdit) {
    return (
      <div ref={setDropTargetRef} className={isEmpty ? s.emptyWrapper : clsx(cellClassName)}>
        {userDropPlaceholder ? (
          <span className={clsx(s.userWrapper, s.userPlaceholder)}>
            <User name={userDropPlaceholder.name} avatarUrl={userDropPlaceholder.avatarUrl} size="card" isMember />
          </span>
        ) : (
          addUserNode
        )}
      </div>
    );
  }

  return (
    <div ref={setDropTargetRef} className={clsx(cellClassName)}>
      {usersNode}
      {userDropPlaceholder && (
        <span className={clsx(s.userWrapper, s.userPlaceholder)}>
          <User name={userDropPlaceholder.name} avatarUrl={userDropPlaceholder.avatarUrl} size="card" isMember />
        </span>
      )}
    </div>
  );
});

MembersCell.propTypes = {
  id: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onUserEmailLookup: PropTypes.func.isRequired,
};

MembersCell.defaultProps = {
  cellClassName: '',
};

export default MembersCell;
