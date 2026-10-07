import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import { dragKey, getDragData, useDropAnimation } from '../../lib/hooks/use-drop-animation';
import { useTaskDropSlot } from '../../lib/hooks/use-task-drop-slot';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import MembershipsPopup from '../MembershipsPopup';
import User from '../User';
import { Button, ButtonVariant, Icon, IconType, IconSize, Checkbox, CheckboxSize } from '../Utils';
import TaskActionsPopup from './TaskActionsPopup';
import TaskEdit from './TaskEdit';

import * as gs from '../../global.module.scss';
import * as s from './Task.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  LISTVIEW: 'listView',
};

const Task = React.memo(
  ({
    cardId,
    cardName,
    variant,
    id,
    index,
    name,
    dueDate,
    completedAt,
    showFullDueDates,
    allBoardMemberships,
    boardMemberships,
    users,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
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
    onUserEmailLookup,
    onActivitiesFetch,
  }) => {
    const [t] = useTranslation();
    const nameEdit = useRef(null);
    const wrapperRef = useRef(null);
    const taskRef = useRef(null);
    const taskActionsPopupRef = useRef(null);
    const taskDueDateEditPopupRef = useRef(null);
    const taskMembershipsPopupRef = useRef(null);

    const isDragging = useTaskDropSlot((slot) => slot?.taskId === id && slot.variant === variant);
    const placeholderHeight = useTaskDropSlot((slot) => (slot && slot.cardId === cardId && slot.variant === variant && slot.placeholderIndex === index ? slot.height : null));
    const key = dragKey('task', `${variant}:${id}`); // Key contains variant because there could be 2 instances of tasks at the same time

    useEffect(() => {
      // DnD: the whole task is the drag handle, and also a drop target (drop above/below it)
      const wrapper = wrapperRef.current;
      const task = taskRef.current;

      if (!wrapper || !task) {
        return undefined;
      }

      const data = { type: DroppableTypes.TASK, taskId: id, cardId, variant, index };

      return combine(
        draggable({
          element: wrapper,
          canDrag: () => isPersisted && canEdit,
          getInitialData: ({ input }) => ({
            ...data,
            height: task.offsetHeight,
            ...getDragData(task, input, key),
          }),
          onGenerateDragPreview: () => {
            taskActionsPopupRef.current?.close();
            taskMembershipsPopupRef.current?.close();
            taskDueDateEditPopupRef.current?.close();
          },
        }),
        dropTargetForElements({
          element: wrapper,
          canDrop: ({ source }) => source.data.type === DroppableTypes.TASK && source.data.cardId === cardId && source.data.variant === variant,
          getData: ({ input }) =>
            attachClosestEdge(data, {
              input,
              element: task,
              allowedEdges: ['top', 'bottom'],
            }),
        }),
      );
    }, [id, cardId, variant, index, isPersisted, canEdit, key]);

    useDropAnimation(taskRef, key);

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
      <div ref={wrapperRef}>
        {placeholderHeight !== null && <div style={{ height: placeholderHeight }} />}
        <div ref={taskRef} className={clsx(s.wrapper, gs.scrollableX, s.contentHoverable, isDragging && gs.hidden)}>
          <Checkbox checked={isCompleted} size={checkboxSize} disabled={!isPersisted || !canEdit} onChange={handleToggleChange} title={isCompleted ? t('common.markAsNotDone') : t('common.markAsDone')} />
          <TaskEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <span className={clsx(s.task, isCompleted && s.taskCompleted, canEdit && s.taskEditable)} onClick={handleClick} title={name}>
              {name}
            </span>
            {users && (
              <MembershipsPopup
                ref={taskMembershipsPopupRef}
                items={allBoardMemberships}
                currentUserIds={users.map((user) => user.id)}
                memberships={boardMemberships}
                onUserSelect={onUserAdd}
                onUserDeselect={onUserRemove}
                onUserEmailLookup={onUserEmailLookup}
                offset={0}
                position="left-start"
                disabled={!(canEdit && isPersisted)}
              >
                {membersNode}
              </MembershipsPopup>
            )}
            {dueDate && (
              <div className={clsx(s.dueDate, canEdit && gs.cursorGrab, isCompleted && s.itemCompleted, variant !== VARIANTS.CARDMODAL && s.dueDateCard)}>
                <DueDateEditPopup ref={taskDueDateEditPopupRef} defaultValue={dueDate} onUpdate={handleDueDateUpdate} disabled={!(canEdit && isPersisted)}>
                  <DueDate variant={dueDateVariant} value={dueDate} completedAt={completedAt} isClickable={canEdit && isPersisted} showFullDueDates={showFullDueDates} />
                </DueDateEditPopup>
              </div>
            )}
            {isPersisted && (
              <TaskActionsPopup
                ref={taskActionsPopupRef}
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
                lastActivityId={lastActivityId}
                canEdit={canEdit}
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
                onUserEmailLookup={onUserEmailLookup}
                onActivitiesFetch={onActivitiesFetch}
                hideCloseButton
                position="left-start"
                offset={0}
              >
                <Button variant={ButtonVariant.Icon} title={t('common.editTask')} className={clsx(s.button, s.target, variant !== VARIANTS.CARDMODAL && s.buttonCard)}>
                  <Icon type={IconType.EllipsisVertical} size={IconSize.Size10} className={s.icon} />
                </Button>
              </TaskActionsPopup>
            )}
          </TaskEdit>
        </div>
      </div>
    );
  },
);

Task.propTypes = {
  cardId: PropTypes.string.isRequired,
  cardName: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)).isRequired,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  completedAt: PropTypes.instanceOf(Date),
  showFullDueDates: PropTypes.bool.isRequired,
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
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
  onUserEmailLookup: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Task.defaultProps = {
  dueDate: undefined,
  completedAt: undefined,
  lastActivityId: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default Task;
