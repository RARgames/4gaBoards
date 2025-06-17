import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import TaskAddPopup from '../../../TaskAddPopup';
import Tasks from '../../../Tasks';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './TasksCell.module.scss';

const TasksCell = React.memo(
  ({ id, tasks, cellClassName, allBoardMemberships, boardMemberships, canEdit, onTaskUpdate, onTaskDuplicate, onTaskDelete, onUserToTaskAdd, onUserFromTaskRemove, onTaskCreate, onTaskMove }) => {
    const [t] = useTranslation();

    if (tasks.length === 0) {
      if (canEdit) {
        return (
          <TaskAddPopup onCreate={onTaskCreate} wrapperClassName={s.popupWrapper}>
            <Button style={ButtonStyle.Icon} title={t('common.addTask')} className={clsx(cellClassName, s.addButton)}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
            </Button>
          </TaskAddPopup>
        );
      }

      return null;
    }

    return (
      <div className={cellClassName}>
        <Tasks
          variant="listView"
          cardId={id}
          items={tasks}
          canEdit={canEdit}
          allBoardMemberships={allBoardMemberships}
          boardMemberships={boardMemberships}
          onCreate={onTaskCreate}
          onUpdate={onTaskUpdate}
          onMove={onTaskMove}
          onDuplicate={onTaskDuplicate}
          onDelete={onTaskDelete}
          onUserAdd={onUserToTaskAdd}
          onUserRemove={onUserFromTaskRemove}
          cellClassName={cellClassName}
        />
      </div>
    );
  },
);

TasksCell.propTypes = {
  id: PropTypes.string.isRequired,
  tasks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskDuplicate: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onUserToTaskAdd: PropTypes.func.isRequired,
  onUserFromTaskRemove: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
};

TasksCell.defaultProps = {
  cellClassName: '',
};

export default TasksCell;
