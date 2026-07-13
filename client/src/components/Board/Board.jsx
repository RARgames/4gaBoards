import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import ArchiveViewContainer from '../../containers/ArchiveViewContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListContainer from '../../containers/ListContainer';
import ListViewContainer from '../../containers/ListViewContainer';
import SwimlanesViewContainer from '../../containers/SwimlanesViewContainer';
import DragPreviewContext from '../../contexts/DragPreviewContext';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import ListAdd from './ListAdd';

import * as gs from '../../global.module.scss';
import * as s from './Board.module.scss';

const parseDndDestination = (dndId) => dndId.split(':');

const Board = React.memo(({ id, listIds, isCardModalOpened, canEdit, defaultView, onListCreate, onListMove, onCardMove, onTaskMove }) => {
  const [t] = useTranslation();
  const [isListAddOpened, setIsListAddOpened] = useState(false);
  const wrapper = useRef(null);
  const prevPosition = useRef(null);
  const [viewMode, setViewMode] = useState(defaultView);
  // §6.7: live card-drag destination for the placement-preview ghost — see DragPreviewContext
  // for why this is plain state + context rather than Redux.
  const [dragPreview, setDragPreview] = useState(null);

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  // §6.6: the Done list's archive-teaser row switches straight to the Archive view — threaded
  // down to ListContainer the same way viewMode/onViewModeChange already reaches BoardActionsContainer.
  const handleArchiveViewOpen = useCallback(() => {
    setViewMode('archive');
  }, []);

  const handleDragStart = useCallback(({ draggableId, type, source }) => {
    if (type !== DroppableTypes.CARD) {
      setDragPreview(null);
      return;
    }
    // Measure the dragged card's element once, while it's still in the DOM at its origin.
    // Destination lists have never measured this card themselves, and need its height both to
    // size the drop-preview box and to reserve the right amount of space for displaced cards.
    const draggedElement = document.querySelector(`[data-rbd-draggable-id="${draggableId}"]`);
    setDragPreview({
      draggableId,
      source,
      destination: null,
      cardHeight: draggedElement ? draggedElement.offsetHeight : null,
    });
  }, []);

  const handleDragUpdate = useCallback(({ type, destination }) => {
    if (type !== DroppableTypes.CARD) {
      return;
    }
    // rbd calls onDragUpdate on every animation frame while dragging, not just when the
    // destination actually changes — without a bail-out, a card merely hovering in place would
    // re-render every list on every frame, which showed up as visible glitching. Only commit a
    // new object when the logical destination differs; draggableId/source/cardHeight are set
    // once at drag start and constant for the whole drag.
    setDragPreview((prev) => {
      if (!prev) {
        return prev;
      }
      if (!destination) {
        return prev.destination === null ? prev : { ...prev, destination: null };
      }
      if (prev.destination && prev.destination.droppableId === destination.droppableId && prev.destination.index === destination.index) {
        return prev;
      }
      return { ...prev, destination };
    });
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      setDragPreview(null);

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
    (e) => {
      if (e.button && e.button !== 0) {
        return;
      }

      if (e.target !== wrapper.current && !e.target.dataset.dragScroller) {
        return;
      }

      e.preventDefault(); // Prevent text selecton when dragging board
      if (document.activeElement) {
        document.activeElement.blur();
      }
      prevPosition.current = e.screenX;

      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    },
    [wrapper],
  );

  const handleWindowMouseMove = useCallback(
    (e) => {
      if (!prevPosition.current) {
        return;
      }

      wrapper.current?.scrollBy({ left: prevPosition.current - e.screenX });
      prevPosition.current = e.screenX;
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

  const boardView = (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div ref={wrapper} className={clsx(s.boardWrapper, gs.scrollableX)} onMouseDown={handleMouseDown}>
      <DragPreviewContext.Provider value={dragPreview}>
        <DragDropContext onDragStart={handleDragStart} onDragUpdate={handleDragUpdate} onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type={DroppableTypes.LIST} direction="horizontal">
            {({ innerRef, droppableProps, placeholder }) => (
              <div
                {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                data-drag-scroller
                ref={innerRef}
                className={clsx(s.lists, gs.cursorGrab)}
              >
                {listIds.map((listId, index) => (
                  <ListContainer key={listId} id={listId} index={index} onArchiveViewOpen={handleArchiveViewOpen} />
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
      </DragPreviewContext.Provider>
    </div>
  );

  const listView = (
    <div className={clsx(s.listWrapper)}>
      <ListViewContainer />
    </div>
  );

  const swimlanesView = (
    <div className={clsx(s.listWrapper)}>
      <SwimlanesViewContainer />
    </div>
  );

  const archiveView = (
    <div className={clsx(s.listWrapper)}>
      <ArchiveViewContainer />
    </div>
  );

  return (
    <div className={s.boardContainer}>
      <BoardActionsContainer boardId={id} viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className={s.mainWrapper}>
        {viewMode === 'board' && boardView}
        {viewMode === 'list' && listView}
        {viewMode === 'swimlanes' && swimlanesView}
        {viewMode === 'archive' && archiveView}
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
  defaultView: PropTypes.string.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
};

export default Board;
