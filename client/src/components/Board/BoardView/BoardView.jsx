import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../../constants/DroppableTypes';
import ListContainer from '../../../containers/ListContainer';
import { resolveCardDropSlot, setCardDropSlot } from '../../../lib/hooks/use-card-drop-slot';
import { resolveListDropSlot, setListDropSlot, useListDropSlot } from '../../../lib/hooks/use-list-drop-slot';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../../Utils';
import ListAdd from './ListAdd';

import * as gs from '../../../global.module.scss';
import * as s from './BoardView.module.scss';

const LIST_PLACEHOLDER_MARGIN = 10;

const BoardView = React.memo(({ listIds, canEdit, onListCreate, onListMove, onCardMove }) => {
  const [t] = useTranslation();
  const [isListAddOpened, setIsListAddOpened] = useState(false);
  const wrapper = useRef(null);
  const prevPosition = useRef(null);

  const listPlaceholderWidth = useListDropSlot((slot) => (slot && slot.placeholderIndex >= listIds.length ? slot.width : null));

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  useEffect(
    () =>
      monitorForElements({
        onDrop: ({ source, location }) => {
          setListDropSlot(null);
          setCardDropSlot(null);

          // targets are ordered innermost first
          const targets = location.current.dropTargets;
          if (!targets.length) {
            return;
          }

          const sourceData = source.data;

          switch (sourceData.type) {
            case DroppableTypes.LIST: {
              const destination = resolveListDropSlot(source, location);
              if (destination.index === sourceData.index) {
                return;
              }

              onListMove(sourceData.listId, destination.index);

              break;
            }
            case DroppableTypes.CARD: {
              const destination = resolveCardDropSlot(source, location);
              if (destination.index === sourceData.index && destination.listId === sourceData.listId) {
                return;
              }

              onCardMove(sourceData.cardId, destination.listId, destination.index);

              break;
            }
            default:
          }
        },
      }),
    [onListMove, onCardMove],
  );

  useEffect(() => {
    const cleanup = monitorForElements({
      canMonitor: ({ source }) => source.data.type === DroppableTypes.CARD,
      onDragStart: ({ source, location }) => setCardDropSlot(resolveCardDropSlot(source, location)),
      onDrag: ({ source, location }) => setCardDropSlot(resolveCardDropSlot(source, location)),
    });

    return () => {
      cleanup();
      setCardDropSlot(null);
    };
  }, []);

  useEffect(() => {
    const cleanup = monitorForElements({
      canMonitor: ({ source }) => source.data.type === DroppableTypes.LIST,
      onDragStart: ({ source, location }) => setListDropSlot(resolveListDropSlot(source, location)),
      onDrag: ({ source, location }) => setListDropSlot(resolveListDropSlot(source, location)),
    });

    return () => {
      cleanup();
      setListDropSlot(null);
    };
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button && e.button !== 0) {
        return;
      }

      if (e.target !== wrapper.current && !e.target?.hasAttribute('data-drag-scroller')) {
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

  useEffect(() => {
    if (!wrapper.current) {
      return undefined;
    }

    return combine(
      autoScrollForElements({
        element: wrapper.current,
        canScroll: ({ source }) => source.data.type === DroppableTypes.LIST || source.data.type === DroppableTypes.CARD,
      }),
      dropTargetForElements({
        element: wrapper.current,
        canDrop: ({ source }) => source.data.type === DroppableTypes.LIST,
        getData: () => ({ type: DroppableTypes.LIST }),
      }),
    );
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div ref={wrapper} className={clsx(s.boardWrapper, gs.scrollableX)} onMouseDown={handleMouseDown}>
      <div data-drag-scroller className={clsx(s.lists, gs.cursorGrab)}>
        {listIds.map((listId, index) => (
          <ListContainer key={listId} id={listId} index={index} />
        ))}
        {listPlaceholderWidth !== null && <div style={{ width: listPlaceholderWidth + LIST_PLACEHOLDER_MARGIN }} />}
        {canEdit && (
          <div data-drag-scroller className={s.list}>
            {isListAddOpened ? (
              <ListAdd onCreate={onListCreate} onClose={handleAddListClose} />
            ) : (
              <Button variant={ButtonVariant.Icon} title={t('common.addList')} onClick={handleAddListClick} className={s.addListButton}>
                <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.addListButtonIcon} />
                <span className={s.addListButtonText}>{t('common.addList')}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

BoardView.propTypes = {
  listIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
};

export default BoardView;
