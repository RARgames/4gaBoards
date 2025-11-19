import React, { useCallback, useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import MembershipsPopup from '../MembershipsPopup';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, Checkbox, CheckboxSize } from '../Utils';
import ActionsPopup from './ActionsPopup';
import TaskEdit from './TaskEdit';

import * as gs from '../../global.module.scss';
import * as s from './Item.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  LISTVIEW: 'listView',
};

const Item = React.memo(
  ({
    cardId,
    cardName,
    variant,
    id,
    index,
    name,
    dueDate,
    allBoardMemberships,
    boardMemberships,
    users,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isCompleted,
    isPersisted,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    onUpdate,
    onDuplicate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onActivitiesFetch,
  }) => {
    const [t] = useTranslation();
    const nameEdit = useRef(null);

    const handleClick = useCallback(() => {
      if (isPersisted && canEdit) {
        nameEdit.current?.open();
      }
    }, [isPersisted, canEdit]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleToggleChange = useCallback(() => {
      setTimeout(() => {
        onUpdate({
          isCompleted: !isCompleted,
        });
      }, 0);
      // TODO this timeout fixes slow task checkbox updates, but not in development
    }, [isCompleted, onUpdate]);

    const handleNameEdit = useCallback(() => {
      nameEdit.current?.open();
    }, []);

    const handleDueDateUpdate = useCallback(
      (newDueDate) => {
        onUpdate({
          dueDate: newDueDate,
        });
      },
      [onUpdate],
    );

    let visibleMembersCount;
    let dueDateVariant;
    let userSize;
    let checkboxSize;
    switch (variant) {
      case VARIANTS.CARD:
        visibleMembersCount = 1;
        dueDateVariant = 'tasksCard';
        userSize = 'cardTasks';
        checkboxSize = CheckboxSize.Size14;
        break;
      case VARIANTS.CARDMODAL:
        visibleMembersCount = 3;
        dueDateVariant = 'cardModal';
        userSize = 'card';
        checkboxSize = CheckboxSize.Size20;
        break;
      case VARIANTS.LISTVIEW:
        visibleMembersCount = 3;
        dueDateVariant = 'tasksCard';
        userSize = 'cardTasks';
        checkboxSize = CheckboxSize.Size14;
        break;
      default:
        visibleMembersCount = 5;
        break;
    }

    const membersNode = (
      <div className={clsx(s.members, canEdit && gs.cursorPointer, isCompleted && s.itemCompleted)}>
        {users.slice(0, visibleMembersCount).map((user) => (
          <span key={user.id} className={s.member}>
            <User name={user.name} avatarUrl={user.avatarUrl} size={userSize} isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
          </span>
        ))}
        {users.length > visibleMembersCount && (
          <span
            className={clsx(s.moreMembers, variant !== VARIANTS.CARDMODAL && s.moreMembersCard)}
            title={users
              .slice(visibleMembersCount)
              .map((user) => user.name)
              .join(',\n')}
          >
            +{users.length - visibleMembersCount}
          </span>
        )}
      </div>
    );

    return (
      <Draggable draggableId={id} index={index} isDragDisabled={!isPersisted || !canEdit}>
        {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
          const contentNode = (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={clsx(s.wrapper, gs.scrollableX, canEdit && s.contentHoverable)}>
              <Checkbox
                checked={isCompleted}
                size={checkboxSize}
                disabled={!isPersisted || !canEdit}
                className={s.checkbox}
                onChange={handleToggleChange}
                title={isCompleted ? t('common.markAsUncompleted') : t('common.markAsCompleted')}
              />
              <TaskEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <span className={clsx(s.task, isCompleted && s.taskCompleted, canEdit && s.taskEditable)} onClick={handleClick} title={name}>
                  {name}
                </span>
                {users && (
                  <MembershipsPopup
                    items={allBoardMemberships}
                    currentUserIds={users.map((user) => user.id)}
                    memberships={boardMemberships}
                    onUserSelect={onUserAdd}
                    onUserDeselect={onUserRemove}
                    offset={0}
                    position="left-start"
                    disabled={!(canEdit && isPersisted)}
                  >
                    {membersNode}
                  </MembershipsPopup>
                )}
                {dueDate && (
                  <div className={clsx(s.dueDate, canEdit && gs.cursorGrab, isCompleted && s.itemCompleted, variant !== VARIANTS.CARDMODAL && s.dueDateCard)}>
                    <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} disabled={!(canEdit && isPersisted)}>
                      <DueDate variant={dueDateVariant} value={dueDate} isClickable={canEdit && isPersisted} />
                    </DueDateEditPopup>
                  </div>
                )}
                {isPersisted && canEdit && (
                  <ActionsPopup
                    cardId={cardId}
                    cardName={cardName}
                    name={name}
                    dueDate={dueDate}
                    allBoardMemberships={allBoardMemberships}
                    boardMemberships={boardMemberships}
                    users={users}
                    activities={activities}
                    isActivitiesFetching={isActivitiesFetching}
                    isAllActivitiesFetched={isAllActivitiesFetched}
                    createdAt={createdAt}
                    createdBy={createdBy}
                    updatedAt={updatedAt}
                    updatedBy={updatedBy}
                    onUpdate={handleDueDateUpdate}
                    onDuplicate={onDuplicate}
                    onNameEdit={handleNameEdit}
                    onDelete={onDelete}
                    onUserAdd={onUserAdd}
                    onUserRemove={onUserRemove}
                    onActivitiesFetch={onActivitiesFetch}
                    hideCloseButton
                    position="left-start"
                    offset={0}
                  >
                    <Button style={ButtonStyle.Icon} title={t('common.editTask')} className={clsx(s.button, s.target, variant !== VARIANTS.CARDMODAL && s.buttonCard)}>
                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size10} className={s.icon} />
                    </Button>
                  </ActionsPopup>
                )}
              </TaskEdit>
            </div>
          );

          return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
        }}
      </Draggable>
    );
  },
);

Item.propTypes = {
  cardId: PropTypes.string.isRequired,
  cardName: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)).isRequired,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Item.defaultProps = {
  dueDate: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default Item;
