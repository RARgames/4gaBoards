import React, { useCallback, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, ButtonStyle, ProgressBar, ProgressBarSize } from '../../Utils';

import DroppableTypes from '../../../constants/DroppableTypes';
import Item from './Item';
import TaskAdd from './TaskAdd';

import styles from './Tasks.module.scss';

const Tasks = React.forwardRef(({ items, canEdit, onCreate, onUpdate, onMove, onDelete }, ref) => {
  const [t] = useTranslation();
  const taskAddRef = useRef(null);

  const open = useCallback(() => {
    if (taskAddRef.current) {
      taskAddRef.current.open();
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open,
    }),
    [open],
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

  const completedItems = items.filter((item) => item.isCompleted);

  return (
    <>
      {items.length > 0 && <ProgressBar value={completedItems.length} total={items.length} size={ProgressBarSize.Tiny} className={styles.progress} />}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks" type={DroppableTypes.TASK}>
          {({ innerRef, droppableProps, placeholder }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...droppableProps} ref={innerRef}>
              {items.map((item, index) => (
                <Item
                  key={item.id}
                  id={item.id}
                  index={index}
                  name={item.name}
                  isCompleted={item.isCompleted}
                  isPersisted={item.isPersisted}
                  canEdit={canEdit}
                  onUpdate={(data) => handleUpdate(item.id, data)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
              {placeholder}
              {canEdit && (
                <TaskAdd ref={taskAddRef} onCreate={onCreate}>
                  <Button style={ButtonStyle.Default} content={t('common.addTask')} className={styles.taskButton} />
                </TaskAdd>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
});

Tasks.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Tasks;
