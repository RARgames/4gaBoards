import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListContainer from '../../containers/ListContainer';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import ListAdd from './ListAdd';

import * as gs from '../../globalStyles.module.scss';
import * as s from './Board.module.scss';

const parseDndDestination = (dndId) => dndId.split(':');

const Board = React.memo(({ id, listIds, isCardModalOpened, canEdit, onListCreate, onListMove, onCardMove, onTaskMove }) => {
  const [t] = useTranslation();
  const [isListAddOpened, setIsListAddOpened] = useState(false);
  const wrapper = useRef(null);
  const prevPosition = useRef(null);

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
        return;
      }

      const [, dndId] = parseDndDestination(draggableId);

      switch (type) {
        case DroppableTypes.LIST:
          onListMove(dndId, destination.index);

          break;
        case DroppableTypes.CARD: {
          const [, listId, indexOverride] = parseDndDestination(destination.droppableId);
          const [, sourceListId] = parseDndDestination(source.droppableId);

          onCardMove(dndId, listId, (listId === sourceListId ? indexOverride - 1 : indexOverride) || destination.index);

          break;
        }
        case DroppableTypes.TASK: {
          onTaskMove(draggableId, destination.index);

          break;
        }
        default:
      }
    },
    [onListMove, onCardMove, onTaskMove],
  );

  const handleMouseDown = useCallback(
    (event) => {
      if (event.button && event.button !== 0) {
        return;
      }

      if (event.target !== wrapper.current && !event.target.dataset.dragScroller) {
        return;
      }

      event.preventDefault(); // Prevent text selecton when dragging board
      if (document.activeElement) {
        document.activeElement.blur();
      }
      prevPosition.current = event.screenX;

      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    },
    [wrapper],
  );

  const handleWindowMouseMove = useCallback(
    (event) => {
      if (!prevPosition.current) {
        return;
      }

      wrapper.current.scrollBy({ left: prevPosition.current - event.screenX });
      prevPosition.current = event.screenX;
    },
    [prevPosition],
  );

  const handleWindowMouseUp = useCallback(() => {
    prevPosition.current = null;
  }, [prevPosition]);

  useEffect(() => {
    if (isListAddOpened) {
      wrapper.current.scrollLeft = wrapper.current.scrollWidth;
    }
  }, [listIds, isListAddOpened]);

  useEffect(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [handleWindowMouseMove, handleWindowMouseUp]);

  return (
    <div className={s.boardContainer}>
      <BoardActionsContainer boardId={id} />
      <div className={s.mainWrapper}>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div ref={wrapper} className={classNames(s.wrapper, gs.scrollableX)} onMouseDown={handleMouseDown}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type={DroppableTypes.LIST} direction="horizontal">
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  data-drag-scroller
                  ref={innerRef}
                  className={classNames(s.lists, gs.cursorGrab)}
                >
                  {listIds.map((listId, index) => (
                    <ListContainer key={listId} id={listId} index={index} />
                  ))}
                  {placeholder}
                  {canEdit && (
                    <div data-drag-scroller className={s.list}>
                      {isListAddOpened ? (
                        <ListAdd onCreate={onListCreate} onClose={handleAddListClose} />
                      ) : (
                        <Button style={ButtonStyle.Icon} title={t('common.addList')} onClick={handleAddListClick} className={s.addListButton}>
                          <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.addListButtonIcon} />
                          <span className={s.addListButtonText}>{t('action.addList')}</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        {isCardModalOpened && <CardModalContainer />}
      </div>
    </div>
  );
});

Board.propTypes = {
  id: PropTypes.string.isRequired,
  listIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardModalOpened: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
};

export default Board;
