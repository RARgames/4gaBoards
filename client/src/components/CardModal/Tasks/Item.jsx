import React, { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Draggable } from 'react-beautiful-dnd';
import { Checkbox } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { Icon, IconType, IconSize } from '../../Utils/Icon';
import { Button, ButtonStyle } from '../../Utils/Button';

import TaskEdit from './TaskEdit';
import ActionsPopup from './ActionsPopup';

import styles from './Item.module.scss';

const Item = React.memo(({ id, index, name, isCompleted, isPersisted, canEdit, onUpdate, onDelete }) => {
  const [t] = useTranslation();
  const nameEdit = useRef(null);

  const handleClick = useCallback(() => {
    if (isPersisted && canEdit) {
      nameEdit.current.open();
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
    onUpdate({
      isCompleted: !isCompleted,
    });
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
            <span className={styles.checkboxWrapper}>
              <Checkbox checked={isCompleted} disabled={!isPersisted || !canEdit} className={styles.checkbox} onChange={handleToggleChange} />
            </span>
            <TaskEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
              <div className={classNames(canEdit && styles.contentHoverable)}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <span className={classNames(styles.text, canEdit && styles.textEditable)} onClick={handleClick}>
                  <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>{name}</span>
                </span>
                {isPersisted && canEdit && (
                  <ActionsPopup onNameEdit={handleNameEdit} onDelete={onDelete} hideCloseButton position="left-start" offset={25}>
                    <Button style={ButtonStyle.Icon} title={t('common.editTask')} className={classNames(styles.button, styles.target)}>
                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size10} />
                    </Button>
                  </ActionsPopup>
                )}
              </div>
            </TaskEdit>
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Item;
