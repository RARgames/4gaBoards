import pick from 'lodash/pick';
import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import Paths from '../../constants/Paths';
import DroppableTypes from '../../constants/DroppableTypes';
import AddPopup from './AddPopup';
import EditPopup from './EditPopup';

import styles from './Boards.module.scss';
import gStyles from '../../globalStyles.module.scss';

const Boards = React.memo(({ items, currentId, canEdit, onCreate, onUpdate, onMove, onDelete }) => {
  const [t] = useTranslation();
  const tabsWrapper = useRef(null);

  const handleWheel = useCallback(({ deltaY }) => {
    tabsWrapper.current.scrollBy({
      left: deltaY,
    });
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

  const itemsNode = items.map((item, index) => (
    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!item.isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...draggableProps} ref={innerRef} className={styles.tabWrapper}>
          <div className={classNames(styles.tab, item.id === currentId && styles.tabActive)}>
            {item.isPersisted ? (
              <>
                <Link
                  {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                  to={Paths.BOARDS.replace(':id', item.id)}
                  title={item.name}
                  className={styles.link}
                >
                  {item.name}
                </Link>
                {canEdit && (
                  <EditPopup defaultData={pick(item, 'name')} onUpdate={(data) => handleUpdate(item.id, data)} onDelete={() => handleDelete(item.id)}>
                    <Button style={ButtonStyle.Icon} title={t('common.renameBoard')} className={classNames(styles.editButton, styles.target)}>
                      <Icon type={IconType.Pencil} size={IconSize.Size13} />
                    </Button>
                  </EditPopup>
                )}
              </>
            ) : (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <span {...dragHandleProps} className={styles.link}>
                {item.name}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  ));

  return (
    <div className={styles.wrapper} onWheel={handleWheel}>
      <div ref={tabsWrapper} className={classNames(styles.tabsWrapper, gStyles.scrollableX)}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="horizontal">
            {({ innerRef, droppableProps, placeholder }) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <div {...droppableProps} ref={innerRef} className={styles.tabs}>
                {itemsNode}
                {placeholder}
                {canEdit && (
                  <AddPopup onCreate={onCreate}>
                    <Button style={ButtonStyle.Icon} title={t('common.addBoard')} className={classNames(styles.addButton)}>
                      <Icon type={IconType.Plus} size={IconSize.Size13} />
                    </Button>
                  </AddPopup>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
});

Boards.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentId: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Boards.defaultProps = {
  currentId: undefined,
};

export default Boards;
