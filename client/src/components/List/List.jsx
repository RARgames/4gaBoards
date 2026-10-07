import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import { ResizeObserverSizeTypes } from '../../constants/Enums';
import CardContainer from '../../containers/CardContainer';
import { useResizeObserverSize } from '../../hooks';
import { useCardDropSlot } from '../../lib/hooks/use-card-drop-slot';
import { dragKey, getDragData, useDropAnimation } from '../../lib/hooks/use-drop-animation';
import { useListDropSlot } from '../../lib/hooks/use-list-drop-slot';
import CardAddPopup from '../CardAddPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';
import CardAdd from './CardAdd';
import ListActionsPopup from './ListActionsPopup';
import NameEdit from './NameEdit';

import * as gs from '../../global.module.scss';
import * as s from './List.module.scss';

const CARD_PLACEHOLDER_MARGIN = 8;
const COLLAPSED_CARD_PLACEHOLDER_HEIGHT = 40;
const LIST_PLACEHOLDER_MARGIN = 10;

const List = React.memo(
  ({
    id,
    index,
    name,
    isPersisted,
    isCollapsed,
    isCompleted,
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
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
    isManager,
    mailTokens,
    mailTokenCount,
    mailServiceAvailable,
    mailServiceInboundEmail,
    onUpdate,
    onDelete,
    onToggleCompleted,
    onCardCreate,
    onActivitiesFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
  }) => {
    const [t] = useTranslation();
    const listName = name.startsWith('common.') ? t(name) : name;
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [addCardAtTop, setAddCardAtTop] = useState(false);
    const [nameEditHeight, setNameEditHeight] = useState(0);
    const [headerNameElement, setHeaderNameElement] = useState();
    const [headerNameHeight] = useResizeObserverSize(headerNameElement, ResizeObserverSizeTypes.CLIENT_HEIGHT);
    const [listOuterWrapperElement, setListOuterWrapperElement] = useState();
    const [listOuterWrapperScrollable] = useResizeObserverSize(listOuterWrapperElement, ResizeObserverSizeTypes.SCROLLABLE);
    const nameEdit = useRef(null);
    const listWrapper = useRef(null);
    const listActionsPopupRef = useRef(null);
    const innerWrapperRef = useRef(null);
    const headerRef = useRef(null);
    const addCardDropRef = useRef(null);
    const collapsedDropRef = useRef(null);
    const outerWrapperRef = useRef(null);
    const cardsCount = cardIds.length;
    const filteredCardsCount = filteredCardIds.length;

    const isDragging = useListDropSlot((slot) => slot?.listId === id);
    const placeholderWidth = useListDropSlot((slot) => (slot && slot.placeholderIndex === index ? slot.width : null));
    const cardPlaceholderHeight = useCardDropSlot((slot) => (slot && slot.listId === id && slot.placeholderIndex >= filteredCardsCount ? slot.height : null));
    const key = dragKey('list', id);
    useDropAnimation(innerWrapperRef, key);

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
      if (isAddCardOpen && listWrapper.current) {
        if (addCardAtTop) {
          listWrapper.current.scrollTop = 0;
        } else {
          listWrapper.current.scrollTop = listWrapper.current.scrollHeight;
        }
      }
    }, [filteredCardIds, isAddCardOpen, addCardAtTop]);

    useEffect(() => {
      if (listWrapper.current) {
        const wrapperOffset = isAddCardOpen || !canEdit ? styleVars.cardsInnerWrapperFullOffset : styleVars.cardsInnerWrapperOffset;
        const headerOffset = nameEditHeight || headerNameHeight;
        listWrapper.current.style.maxHeight = `calc(100vh - ${wrapperOffset}px - (${headerOffset}px - ${styleVars.headerNameDefaultHeight}px)`;
      }
    }, [canEdit, nameEditHeight, headerNameHeight, isAddCardOpen, styleVars, isCollapsed]);

    useEffect(() => {
      // DnD: list header is drag handle, list is drop target for cards (header - top, add card - bottom), drops of lists are handled by the board
      const innerWrapper = innerWrapperRef.current;
      const header = headerRef.current;

      if (!innerWrapper || !header) {
        return undefined;
      }

      const cardTarget = (element, endIndex) =>
        dropTargetForElements({
          element,
          canDrop: ({ source }) => isPersisted && source.data.type === DroppableTypes.CARD,
          getData: () => ({ type: DroppableTypes.CARD, listId: id, endIndex }),
        });

      const cleanups = [
        draggable({
          element: innerWrapper,
          dragHandle: header,
          canDrag: () => isPersisted && canEdit,
          getInitialData: ({ input }) => ({
            type: DroppableTypes.LIST,
            listId: id,
            index,
            width: innerWrapper.offsetWidth,
            height: innerWrapper.offsetHeight,
            ...getDragData(innerWrapper, input, key),
          }),
          onGenerateDragPreview: () => {
            listActionsPopupRef.current?.close();
          },
        }),
      ];

      // Header
      if (!isCollapsed) {
        cleanups.push(cardTarget(header, 0));
      }

      // Fallback for the whole list
      if (outerWrapperRef.current && !isCollapsed) {
        cleanups.push(cardTarget(outerWrapperRef.current, filteredCardsCount));
      }

      // Add Card Button
      if (addCardDropRef.current) {
        cleanups.push(cardTarget(addCardDropRef.current, cardsCount));
      }

      // Collapsed List
      if (collapsedDropRef.current) {
        cleanups.push(cardTarget(collapsedDropRef.current, cardsCount));
      }

      return combine(...cleanups);
    }, [id, index, isPersisted, canEdit, isCollapsed, cardsCount, filteredCardsCount, key]);

    useEffect(() => {
      // Vertical auto scroll of the cards while dragging a card - only for scrollable lists
      if (!listOuterWrapperElement || !listOuterWrapperScrollable) {
        return undefined;
      }

      return autoScrollForElements({
        element: listOuterWrapperElement,
        canScroll: ({ source }) => source.data.type === DroppableTypes.CARD,
      });
    }, [listOuterWrapperElement, listOuterWrapperScrollable]);

    const cardsCountText = () => {
      return isFiltered ? t('common.ofCards', { filteredCount: filteredCardIds.length, count: cardIds.length }) : t('common.cards', { count: cardIds.length });
    };

    const cardsNode = (
      <div className={s.cards}>
        {canEdit && addCardAtTop && <CardAdd isOpen={isAddCardOpen} onCreate={handleCardCreate} onClose={handleAddCardClose} labelIds={labelIds} memberIds={memberIds} />}
        {filteredCardIds.map((cardId, cardIndex) => (
          <CardContainer key={cardId} id={cardId} index={cardIndex} />
        ))}
        {cardPlaceholderHeight !== null && <div style={{ height: cardPlaceholderHeight + CARD_PLACEHOLDER_MARGIN }} />}
        {canEdit && !addCardAtTop && <CardAdd isOpen={isAddCardOpen} onCreate={handleCardCreate} onClose={handleAddCardClose} labelIds={labelIds} memberIds={memberIds} />}
      </div>
    );

    const addCardNode = (
      <div ref={addCardDropRef}>
        {!isAddCardOpen && canEdit && (
          <Button variant={ButtonVariant.Icon} title={t('common.addCard')} onClick={handleAddCardClick} className={s.addCardButton} disabled={!isPersisted}>
            <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.addCardButtonIcon} />
            <span className={s.addCardButtonText}>{t('common.addCard')}</span>
          </Button>
        )}
      </div>
    );

    const collapsedListNode = (
      <div ref={collapsedDropRef} className={s.headerCollapsedInner}>
        {cardPlaceholderHeight !== null && <div style={{ height: COLLAPSED_CARD_PLACEHOLDER_HEIGHT + CARD_PLACEHOLDER_MARGIN }} />}
        <Button variant={ButtonVariant.Icon} title={t('common.expandList')} onClick={handleToggleCollapseClick} className={clsx(s.headerCollapseButtonCollapsed, !canEdit && gs.cursorDefault)}>
          <Icon type={IconType.TriangleDown} size={IconSize.Size8} />
        </Button>
        <div className={s.headerNameCollapsed} title={listName}>
          {listName}
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
          <Button variant={ButtonVariant.Icon} title={t('common.addCard', { context: 'title' })} className={s.collapsedListCardAddButton}>
            <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.collapsedListCardAddButtonIcon} />
          </Button>
        </CardAddPopup>
      </div>
    );

    const placeholderNode = placeholderWidth !== null && <div style={{ width: placeholderWidth + LIST_PLACEHOLDER_MARGIN }} />;

    if (isCollapsed) {
      return (
        <>
          {placeholderNode}
          <div ref={innerWrapperRef} data-drag-scroller className={clsx(s.innerWrapperCollapsed, isDragging && gs.hidden)}>
            <div className={s.outerWrapper}>
              <div ref={headerRef} className={s.headerCollapsed}>
                {collapsedListNode}
              </div>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        {placeholderNode}
        <div ref={innerWrapperRef} data-drag-scroller className={clsx(s.innerWrapper, isDragging && gs.hidden)}>
          <div ref={outerWrapperRef} className={s.outerWrapper}>
            <div ref={headerRef} className={s.header}>
              <Button variant={ButtonVariant.Icon} title={t('common.collapseList')} onClick={handleToggleCollapseClick} className={clsx(s.headerCollapseButton, !canEdit && gs.cursorDefault)}>
                <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={s.iconRotateRight} />
              </Button>
              <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate} onClose={handleNameEditClose} onHeightChange={handleNameEditHeightChange}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div className={clsx(s.headerName, canEdit && gs.cursorPointer)} onClick={handleHeaderNameClick} ref={setHeaderNameElement} title={listName}>
                  {listName}
                </div>
              </NameEdit>
              {isPersisted && (
                <div className={s.popupWrapper}>
                  <ListActionsPopup
                    ref={listActionsPopupRef}
                    name={name}
                    createdAt={createdAt}
                    createdBy={createdBy}
                    updatedAt={updatedAt}
                    updatedBy={updatedBy}
                    boardMemberships={boardMemberships}
                    activities={activities}
                    isActivitiesFetching={isActivitiesFetching}
                    isAllActivitiesFetched={isAllActivitiesFetched}
                    lastActivityId={lastActivityId}
                    isManager={isManager}
                    mailTokens={mailTokens}
                    mailTokenCount={mailTokenCount}
                    mailServiceAvailable={mailServiceAvailable}
                    mailServiceInboundEmail={mailServiceInboundEmail}
                    canEdit={canEdit}
                    isCompleted={isCompleted}
                    onNameEdit={handleNameEdit}
                    onCardAdd={handleCardAdd}
                    onActivitiesFetch={onActivitiesFetch}
                    onMailTokenCreate={onMailTokenCreate}
                    onMailTokenUpdate={onMailTokenUpdate}
                    onMailTokenDelete={onMailTokenDelete}
                    onToggleCompleted={onToggleCompleted}
                    onDelete={onDelete}
                    position="left-start"
                    offset={0}
                    hideCloseButton
                  >
                    <Button variant={ButtonVariant.Icon} title={t('common.editList')} className={s.editListButton}>
                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                    </Button>
                  </ListActionsPopup>
                </div>
              )}
              <div className={s.headerCardsCount}>{cardsCountText()}</div>
            </div>
            {/* eslint-disable-next-line prettier/prettier */}
          <div ref={(el) => { listWrapper.current = el; setListOuterWrapperElement(el); }} className={clsx(s.cardsInnerWrapper, gs.scrollableY, listOuterWrapperScrollable && s.cardsInnerWrapperScrollable)}
            >
              <div className={clsx(s.cardsOuterWrapper, listOuterWrapperScrollable && s.cardsOuterWrapperScrollable)}>{cardsNode}</div>
            </div>
            {addCardNode}
          </div>
        </div>
      </>
    );
  },
);

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
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
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
  isManager: PropTypes.bool.isRequired,
  mailTokens: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailTokenCount: PropTypes.number.isRequired,
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleCompleted: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
};

List.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  lastActivityId: undefined,
};

export default List;
