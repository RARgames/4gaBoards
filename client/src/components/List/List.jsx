import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import { ResizeObserverSizeTypes } from '../../constants/Enums';
import CardContainer from '../../containers/CardContainer';
import { useResizeObserverSize } from '../../hooks';
import CardAddPopup from '../CardAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import ActionsPopup from './ActionsPopup';
import CardAdd from './CardAdd';
import NameEdit from './NameEdit';

import * as gs from '../../global.module.scss';
import * as s from './List.module.scss';

const ESTIMATED_CARD_HEIGHT = 96;

function CardRow({ data, index, style }) {
  const cardId = data.cardIds[index];
  if (!cardId) {
    return null;
  }

  return <CardContainer id={cardId} index={index} style={style} onSizeChange={data.onSizeChange} />;
}

CardRow.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const List = React.memo(
  ({
    id,
    index,
    name,
    isPersisted,
    isCollapsed,
    cardIds,
    isFiltered,
    filteredCardIds,
    labelIds,
    memberIds,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    onUpdate,
    onDelete,
    onCardCreate,
  }) => {
    const [t] = useTranslation();
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [addCardAtTop, setAddCardAtTop] = useState(false);
    const [nameEditHeight, setNameEditHeight] = useState(0);
    const [headerNameElement, setHeaderNameElement] = useState();
    const [headerNameHeight] = useResizeObserverSize(headerNameElement, ResizeObserverSizeTypes.CLIENT_HEIGHT);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [sizeVersion, setSizeVersion] = useState(0);
    const nameEdit = useRef(null);
    const listRef = useRef(null);
    const sizeMap = useRef({});

    const styleVars = useMemo(() => {
      const computedStyle = getComputedStyle(document.body);
      return {
        cardsInnerWrapperFullOffset: parseInt(computedStyle.getPropertyValue('--cardsInnerWrapperFullOffset'), 10),
        cardsInnerWrapperOffset: parseInt(computedStyle.getPropertyValue('--cardsInnerWrapperOffset'), 10),
        headerNameDefaultHeight: parseInt(computedStyle.getPropertyValue('--headerNameDefaultHeight'), 10),
      };
    }, []);

    const handleToggleCollapseClick = useCallback(() => {
      if (isPersisted && canEdit) {
        onUpdate({
          isCollapsed: !isCollapsed,
        });
      }
    }, [isPersisted, canEdit, onUpdate, isCollapsed]);

    const handleHeaderNameClick = useCallback(() => {
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

    const handleAddCardClick = useCallback(() => {
      setAddCardAtTop(false);
      setIsAddCardOpen(true);
    }, []);

    const handleAddCardClose = useCallback(() => {
      setIsAddCardOpen(false);
      setAddCardAtTop(false);
    }, []);

    const handleNameEdit = useCallback(() => {
      nameEdit.current?.open();
    }, []);

    const handleNameEditClose = useCallback(() => {
      setNameEditHeight(null);
    }, []);

    const handleCardAdd = useCallback(() => {
      setAddCardAtTop(true);
      setIsAddCardOpen(true);
    }, []);

    const handleCardCreate = useCallback(
      (data, autoOpen) => {
        if (addCardAtTop) {
          onCardCreate(data, autoOpen, 0);
        } else {
          onCardCreate(data, autoOpen);
        }
      },
      [onCardCreate, addCardAtTop],
    );

    const handleNameEditHeightChange = useCallback((height) => {
      setNameEditHeight(height);
    }, []);

    useEffect(() => {
      if (isAddCardOpen && listRef.current) {
        if (addCardAtTop) {
          listRef.current.scrollToItem(0);
        } else if (filteredCardIds.length > 0) {
          listRef.current.scrollToItem(filteredCardIds.length - 1);
        }
      }
    }, [filteredCardIds, isAddCardOpen, addCardAtTop]);

    useEffect(() => {
      const handleResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // react-window caches each row's height by index. When the card set or order changes
    // (delete, reorder, filter, socket update) those indices remap to different cards, so
    // the cache must be invalidated here or rows render at stale heights and overlap.
    // A card resizing itself is already handled by setCardSize below.
    const prevCardIdsRef = useRef(filteredCardIds);
    useEffect(() => {
      const prev = prevCardIdsRef.current;
      const isSame = prev.length === filteredCardIds.length && prev.every((cardId, cardIndex) => cardId === filteredCardIds[cardIndex]);
      if (!isSame) {
        prevCardIdsRef.current = filteredCardIds;
        listRef.current?.resetAfterIndex(0);
      }
    }, [filteredCardIds]);

    const setCardSize = useCallback(
      (cardId, size) => {
        if (sizeMap.current[cardId] === size) {
          return;
        }
        sizeMap.current[cardId] = size;
        const cardIndex = filteredCardIds.indexOf(cardId);
        if (listRef.current && cardIndex >= 0) {
          listRef.current.resetAfterIndex(cardIndex);
        }
        setSizeVersion((version) => version + 1);
      },
      [filteredCardIds],
    );

    const getCardSize = useCallback((cardIndex) => sizeMap.current[filteredCardIds[cardIndex]] || ESTIMATED_CARD_HEIGHT, [filteredCardIds]);

    const getCardKey = useCallback((cardIndex) => filteredCardIds[cardIndex], [filteredCardIds]);

    const cardsItemData = useMemo(() => ({ cardIds: filteredCardIds, onSizeChange: setCardSize }), [filteredCardIds, setCardSize]);

    const wrapperOffset = isAddCardOpen || !canEdit ? styleVars.cardsInnerWrapperFullOffset : styleVars.cardsInnerWrapperOffset;
    const headerOffset = nameEditHeight || headerNameHeight;
    const availableHeight = Math.max(windowHeight - wrapperOffset - (headerOffset - styleVars.headerNameDefaultHeight), ESTIMATED_CARD_HEIGHT);
    const totalCardsHeight = useMemo(
      () => filteredCardIds.reduce((acc, cardId) => acc + (sizeMap.current[cardId] || ESTIMATED_CARD_HEIGHT), 0),
      [filteredCardIds, sizeVersion], // eslint-disable-line react-hooks/exhaustive-deps
    );
    const listHeight = Math.min(totalCardsHeight, availableHeight) || 1;

    const cardsCountText = () => {
      return isFiltered ? t('common.ofCards', { filteredCount: filteredCardIds.length, count: cardIds.length }) : t('common.cards', { count: cardIds.length });
    };

    const cardsNode = (
      <Droppable
        droppableId={`list:${id}`}
        type={DroppableTypes.CARD}
        isDropDisabled={!isPersisted}
        mode="virtual"
        renderClone={(dragProvided, dragSnapshot, rubric) => <CardContainer id={filteredCardIds[rubric.source.index]} index={rubric.source.index} isClone provided={dragProvided} snapshot={dragSnapshot} />}
      >
        {(droppableProvided) => (
          <VariableSizeList
            ref={listRef}
            outerRef={droppableProvided.innerRef}
            className={s.cards}
            width="100%"
            height={listHeight}
            itemCount={filteredCardIds.length}
            itemSize={getCardSize}
            itemKey={getCardKey}
            itemData={cardsItemData}
            estimatedItemSize={ESTIMATED_CARD_HEIGHT}
            overscanCount={3}
          >
            {CardRow}
          </VariableSizeList>
        )}
      </Droppable>
    );

    const addCardNode = (
      <Droppable droppableId={`listAdd:${id}:${cardIds.length}`} type={DroppableTypes.CARD} isDropDisabled={!isPersisted}>
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef}>
            {placeholder}
            {!isAddCardOpen && canEdit && (
              <Button style={ButtonStyle.Icon} title={t('common.addCard')} onClick={handleAddCardClick} className={s.addCardButton} disabled={!isPersisted}>
                <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.addCardButtonIcon} />
                <span className={s.addCardButtonText}>{t('action.addCard')}</span>
              </Button>
            )}
          </div>
        )}
      </Droppable>
    );

    const collapsedListNode = (
      <Droppable droppableId={`listCollapsed:${id}:${cardIds.length}`} type={DroppableTypes.CARD} isDropDisabled={!isPersisted}>
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef} className={s.headerCollapsedInner}>
            {placeholder}
            <Button style={ButtonStyle.Icon} title={t('common.expandList')} onClick={handleToggleCollapseClick} className={clsx(s.headerCollapseButtonCollapsed, !canEdit && gs.cursorDefault)}>
              <Icon type={IconType.TriangleDown} size={IconSize.Size8} />
            </Button>
            <div className={s.headerNameCollapsed} title={name}>
              {name}
            </div>
            <div className={s.headerCardsCountCollapsed}>{cardsCountText()}</div>
            <CardAddPopup
              lists={[]}
              labelIds={labelIds}
              memberIds={memberIds}
              forcedDefaultListId={id}
              onCreate={(listId, data, autoOpen) => onCardCreate(data, autoOpen)}
              offset={5}
              position="top"
              wrapperClassName={s.cardAddPopupWrapper}
            >
              <Button style={ButtonStyle.Icon} title={t('common.addCard', { context: 'title' })} className={s.collapsedListCardAddButton}>
                <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.collapsedListCardAddButtonIcon} />
              </Button>
            </CardAddPopup>
          </div>
        )}
      </Droppable>
    );

    if (isCollapsed) {
      return (
        <Draggable draggableId={`list:${id}`} index={index} isDragDisabled={!isPersisted || !canEdit}>
          {({ innerRef, draggableProps, dragHandleProps }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...draggableProps} data-drag-scroller ref={innerRef} className={s.innerWrapperCollapsed}>
              <div className={s.outerWrapper}>
                <div
                  {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                  className={s.headerCollapsed}
                >
                  {collapsedListNode}
                </div>
              </div>
            </div>
          )}
        </Draggable>
      );
    }
    return (
      <Draggable draggableId={`list:${id}`} index={index} isDragDisabled={!isPersisted || !canEdit}>
        {({ innerRef, draggableProps, dragHandleProps }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} data-drag-scroller ref={innerRef} className={s.innerWrapper}>
            <div className={s.outerWrapper}>
              <div
                {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                className={s.header}
              >
                <Button style={ButtonStyle.Icon} title={t('common.collapseList')} onClick={handleToggleCollapseClick} className={clsx(s.headerCollapseButton, !canEdit && gs.cursorDefault)}>
                  <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={s.iconRotateRight} />
                </Button>
                <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate} onClose={handleNameEditClose} onHeightChange={handleNameEditHeightChange}>
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                  <div className={clsx(s.headerName, canEdit && gs.cursorPointer)} onClick={handleHeaderNameClick} ref={setHeaderNameElement} title={name}>
                    {name}
                  </div>
                </NameEdit>
                {isPersisted && canEdit && (
                  <div className={s.popupWrapper}>
                    <ActionsPopup
                      name={name}
                      createdAt={createdAt}
                      createdBy={createdBy}
                      updatedAt={updatedAt}
                      updatedBy={updatedBy}
                      boardMemberships={boardMemberships}
                      onNameEdit={handleNameEdit}
                      onCardAdd={handleCardAdd}
                      onDelete={onDelete}
                      position="left-start"
                      offset={0}
                      hideCloseButton
                    >
                      <Button style={ButtonStyle.Icon} title={t('common.editList')} className={s.editListButton}>
                        <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                      </Button>
                    </ActionsPopup>
                  </div>
                )}
                <div className={s.headerCardsCount}>{cardsCountText()}</div>
              </div>
              <div className={s.cardsInnerWrapper}>
                <div className={s.cardsOuterWrapper}>
                  {canEdit && addCardAtTop && <CardAdd isOpen={isAddCardOpen} onCreate={handleCardCreate} onClose={handleAddCardClose} labelIds={labelIds} memberIds={memberIds} />}
                  {cardsNode}
                  {canEdit && !addCardAtTop && <CardAdd isOpen={isAddCardOpen} onCreate={handleCardCreate} onClose={handleAddCardClose} labelIds={labelIds} memberIds={memberIds} />}
                </div>
              </div>
              {addCardNode}
            </div>
          </div>
        )}
      </Draggable>
    );
  },
);

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  filteredCardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
};

List.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default List;
