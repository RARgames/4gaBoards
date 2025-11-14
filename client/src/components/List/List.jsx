import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
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
    const [listOuterWrapperElement, setListOuterWrapperElement] = useState();
    const [listOuterWrapperScrollable] = useResizeObserverSize(listOuterWrapperElement, ResizeObserverSizeTypes.SCROLLABLE);
    const nameEdit = useRef(null);
    const listWrapper = useRef(null);

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

    const cardsCountText = () => {
      return isFiltered ? t('common.ofCards', { filteredCount: filteredCardIds.length, count: cardIds.length }) : t('common.cards', { count: cardIds.length });
    };

    const cardsNode = (
      <Droppable droppableId={`list:${id}`} type={DroppableTypes.CARD} isDropDisabled={!isPersisted}>
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef}>
            <div className={s.cards}>
              {canEdit && addCardAtTop && <CardAdd isOpen={isAddCardOpen} onCreate={handleCardCreate} onClose={handleAddCardClose} labelIds={labelIds} memberIds={memberIds} />}
              {filteredCardIds.map((cardId, cardIndex) => (
                <CardContainer key={cardId} id={cardId} index={cardIndex} />
              ))}
              {placeholder}
              {canEdit && !addCardAtTop && <CardAdd isOpen={isAddCardOpen} onCreate={handleCardCreate} onClose={handleAddCardClose} labelIds={labelIds} memberIds={memberIds} />}
            </div>
          </div>
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
              {/* eslint-disable-next-line prettier/prettier */}
              <div ref={(el) => { listWrapper.current = el; setListOuterWrapperElement(el); }} className={clsx(s.cardsInnerWrapper, gs.scrollableY, listOuterWrapperScrollable && s.cardsInnerWrapperScrollable)}
              >
                <div className={clsx(s.cardsOuterWrapper, listOuterWrapperScrollable && s.cardsOuterWrapperScrollable)}>{cardsNode}</div>
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
