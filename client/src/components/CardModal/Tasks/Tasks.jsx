import React, { useCallback, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Progress } from 'semantic-ui-react';
import { closePopup } from '../../../lib/popup';
import { Button, ButtonStyle } from '../../Utils';

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

  const handleDragStart = useCallback(() => {
    closePopup();
  }, []);

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

  const getTaskbarColor = () => {
    const percentage = (completedItems.length / items.length) * 100;
    if (percentage < 25) {
      return 'red';
    }
    if (percentage < 50) {
      return 'orange';
    }
    if (percentage < 75) {
      return 'yellow';
    }
    if (percentage < 90) {
      return 'olive';
    }
    return 'green';
  };

  return (
    <>
      {items.length > 0 && <Progress autoSuccess value={completedItems.length} total={items.length} color={getTaskbarColor()} size="tiny" className={styles.progress} />}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                  <Button style={ButtonStyle.Default} title={t('common.addTask')} className={styles.taskButton}>
                    <span className={styles.taskButtonText}>{t('action.addTask')}</span>
                  </Button>
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
