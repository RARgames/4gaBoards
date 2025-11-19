import React, { useCallback, useRef, useImperativeHandle } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import { useToggle } from '../../lib/hooks';
import DueDate from '../DueDate';
import { Button, ButtonStyle, ProgressBar, ProgressBarSize, Icon, IconType, IconSize } from '../Utils';
import Item from './Item';
import TaskAdd from './TaskAdd';

import * as s from './Tasks.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  LISTVIEW: 'listView',
};

const Tasks = React.forwardRef(
  (
    {
      cardId,
      cardName,
      variant,
      isCardActive,
      items,
      isActivitiesFetching,
      isAllActivitiesFetched,
      closestDueDate,
      canEdit,
      allBoardMemberships,
      boardMemberships,
      onCreate,
      onUpdate,
      onDuplicate,
      onMove,
      onDelete,
      onUserAdd,
      onUserRemove,
      onMouseEnterTasks,
      onMouseLeaveTasks,
      onActivitiesFetch,
    },
    ref,
  ) => {
    const [t] = useTranslation();
    const taskAddRef = useRef(null);
    const [isOpen, toggleOpen] = useToggle();

    const handleToggleClick = useCallback(() => {
      toggleOpen();
    }, [toggleOpen]);

    const openTaskAdd = useCallback(() => {
      taskAddRef.current?.open();
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        openTaskAdd,
      }),
      [openTaskAdd],
    );

    const handleDragEnd = useCallback(
      ({ draggableId, source, destination }) => {
        if (!destination || source.index === destination.index) {
          return;
        }
        onMove(draggableId, destination.index);
      },
      [onMove],
    );

    const handleUpdate = useCallback(
      (id, data) => {
        onUpdate(id, data);
      },
      [onUpdate],
    );

    const handleDelete = useCallback(
      (id) => {
        onDelete(id);
      },
      [onDelete],
    );

    const handleUserAdd = useCallback(
      (taskId, userId) => {
        onUserAdd(userId, taskId, cardId);
      },
      [cardId, onUserAdd],
    );

    const handleUserRemove = useCallback(
      (taskId, userId) => {
        onUserRemove(userId, taskId);
      },
      [onUserRemove],
    );

    const completedItems = items.filter((item) => item.isCompleted);

    const tasksNode = (
      <Droppable droppableId="tasks" type={DroppableTypes.TASK}>
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef} onMouseEnter={onMouseEnterTasks} onMouseLeave={onMouseLeaveTasks} data-prevent-card-switch>
            {items.map((item, index) => (
              <Item
                cardId={cardId}
                cardName={cardName}
                variant={variant}
                key={item.id}
                id={item.id}
                index={index}
                name={item.name}
                dueDate={item.dueDate}
                allBoardMemberships={allBoardMemberships}
                boardMemberships={boardMemberships}
                users={item.users}
                activities={item.activities}
                isActivitiesFetching={isActivitiesFetching}
                isAllActivitiesFetched={isAllActivitiesFetched}
                isCompleted={item.isCompleted}
                isPersisted={item.isPersisted}
                canEdit={canEdit}
                createdAt={item.createdAt}
                createdBy={item.createdBy}
                updatedAt={item.updatedAt}
                updatedBy={item.updatedBy}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDuplicate={() => onDuplicate(item.id)}
                onDelete={() => handleDelete(item.id)}
                onUserAdd={(userId) => handleUserAdd(item.id, userId)}
                onUserRemove={(userId) => handleUserRemove(item.id, userId)}
                onActivitiesFetch={onActivitiesFetch}
              />
            ))}
            {placeholder}
            {canEdit && (
              <TaskAdd ref={taskAddRef} onCreate={onCreate}>
                <Button
                  style={ButtonStyle.Default}
                  content={t('common.addTask')}
                  className={clsx(s.taskButton, variant === VARIANTS.CARD && s.taskButtonCard, isCardActive && variant === VARIANTS.CARD && s.taskButtonCardActive)}
                />
              </TaskAdd>
            )}
          </div>
        )}
      </Droppable>
    );

    return (
      <div className={clsx(variant !== VARIANTS.LISTVIEW ? s.wrapper : s.wrapperListView)}>
        {items.length > 0 && (
          <div className={clsx(s.progressWrapper, isOpen && s.progressWrapperOpen)}>
            <ProgressBar value={completedItems.length} total={items.length} size={ProgressBarSize.Tiny} className={clsx(variant === VARIANTS.CARDMODAL ? s.progress : s.progressCard)} />
            {variant !== VARIANTS.CARDMODAL && (
              <div className={s.progressItems}>
                {closestDueDate && <DueDate variant="tasksCard" value={closestDueDate} titlePrefix={t('common.dueDateSummary')} iconSize={IconSize.Size12} className={s.dueDateSummary} />}
                <Button style={ButtonStyle.Icon} title={isOpen ? t('common.hideTasks') : t('common.showTasks')} onClick={handleToggleClick} className={s.toggleTasksButton} data-prevent-card-switch>
                  {completedItems.length}/{items.length}
                  <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.countToggleIcon, isOpen && s.countToggleIconOpened)} />
                </Button>
              </div>
            )}
          </div>
        )}
        {variant === VARIANTS.CARDMODAL && <DragDropContext onDragEnd={handleDragEnd}>{tasksNode}</DragDropContext>}
        {variant === VARIANTS.CARD && isOpen && tasksNode}
        {variant === VARIANTS.LISTVIEW && isOpen && <DragDropContext onDragEnd={handleDragEnd}>{tasksNode}</DragDropContext>}
      </div>
    );
  },
);

Tasks.propTypes = {
  cardId: PropTypes.string.isRequired,
  cardName: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)).isRequired,
  isCardActive: PropTypes.bool,
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  closestDueDate: PropTypes.instanceOf(Date),
  canEdit: PropTypes.bool.isRequired,
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onMouseEnterTasks: PropTypes.func,
  onMouseLeaveTasks: PropTypes.func,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Tasks.defaultProps = {
  isCardActive: false,
  closestDueDate: undefined,
  onMouseEnterTasks: () => {},
  onMouseLeaveTasks: () => {},
};

export default Tasks;
