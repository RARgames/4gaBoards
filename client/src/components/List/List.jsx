import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ResizeObserver } from '@juggle/resize-observer';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import DroppableTypes from '../../constants/DroppableTypes';
import CardContainer from '../../containers/CardContainer';
import NameEdit from './NameEdit';
import CardAdd from './CardAdd';
import ActionsPopup from './ActionsPopup';
import { ReactComponent as PlusMathIcon } from '../../assets/images/plus-math-icon.svg';

import styles from './List.module.scss';

const List = React.memo(({ id, index, name, isPersisted, isCollapsed, cardIds, isFiltered, filteredCardIds, canEdit, onUpdate, onDelete, onCardCreate }) => {
  const [t] = useTranslation();
  const [isAddCardOpened, setIsAddCardOpened] = useState(false);
  const [headerNameHeight, setHeaderNameHeight] = useState(0);
  const [nameEditHeight, setNameEditHeight] = useState(0);

  const nameEdit = useRef(null);
  const listWrapper = useRef(null);
  const resizeObserver = useRef(null);

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

  const handleAddCardClick = useCallback(() => {
    setIsAddCardOpened(true);
  }, []);

  const handleAddCardClose = useCallback(() => {
    setIsAddCardOpened(false);
  }, []);

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  const handleNameEditClose = useCallback(() => {
    setNameEditHeight(null);
  }, []);

  const handleCardAdd = useCallback(() => {
    setIsAddCardOpened(true);
  }, []);

  const handleNameEditHeightChange = useCallback((height) => {
    setNameEditHeight(height);
  }, []);

  useEffect(() => {
    if (isAddCardOpened) {
      listWrapper.current.scrollTop = listWrapper.current.scrollHeight;
    }
  }, [filteredCardIds, isAddCardOpened]);

  const handleHeaderNameHeightChange = useCallback((element) => {
    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
    }

    if (!element) {
      resizeObserver.current = null;
      return;
    }

    resizeObserver.current = new ResizeObserver(() => {
      setHeaderNameHeight(element.clientHeight);
    });
    resizeObserver.current.observe(element);
  }, []);

  useEffect(() => {
    if (listWrapper.current) {
      const wrapperOffset = isAddCardOpened || !canEdit ? styleVars.cardsInnerWrapperFullOffset : styleVars.cardsInnerWrapperOffset;
      const headerOffset = nameEditHeight || headerNameHeight;
      listWrapper.current.style.maxHeight = `calc(100vh - ${wrapperOffset}px - (${headerOffset}px - ${styleVars.headerNameDefaultHeight}px)`;
    }
  }, [canEdit, nameEditHeight, headerNameHeight, isAddCardOpened, styleVars]);

  const cardsCountText = () => {
    return [isFiltered ? `${filteredCardIds.length} ${t('common.of')} ${cardIds.length} ` : `${cardIds.length} `] + [cardIds.length !== 1 ? t('common.cards') : t('common.card')];
  };

  const cardsNode = (
    <Droppable droppableId={`list:${id}`} type={DroppableTypes.CARD} isDropDisabled={!isPersisted}>
      {({ innerRef, droppableProps, placeholder }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...droppableProps} ref={innerRef}>
          <div className={styles.cards}>
            {filteredCardIds.map((cardId, cardIndex) => (
              <CardContainer key={cardId} id={cardId} index={cardIndex} />
            ))}
            {placeholder}
            {canEdit && <CardAdd isOpened={isAddCardOpened} onCreate={onCardCreate} onClose={handleAddCardClose} />}
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
          {!isAddCardOpened && canEdit && (
            <button type="button" disabled={!isPersisted} className={styles.addCardButton} onClick={handleAddCardClick}>
              <PlusMathIcon className={styles.addCardButtonIcon} />
              <span className={styles.addCardButtonText}>{t('action.addCard')}</span>
            </button>
          )}
        </div>
      )}
    </Droppable>
  );

  const collapsedListNode = (
    <Droppable droppableId={`listCollapsed:${id}:${cardIds.length}`} type={DroppableTypes.CARD} isDropDisabled={!isPersisted}>
      {({ innerRef, droppableProps, placeholder }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...droppableProps} ref={innerRef} className={styles.headerCollapsedInner}>
          {placeholder}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className={classNames(styles.headerCollapseButtonCollapsed, canEdit && styles.headerEditable)} onClick={handleToggleCollapseClick}>
            <Icon fitted name="triangle down" />
          </div>
          <div className={styles.headerNameCollapsed}>{name}</div>
          <div className={styles.headerCardsCountCollapsed}>{cardsCountText()}</div>
        </div>
      )}
    </Droppable>
  );

  if (isCollapsed) {
    return (
      <Draggable draggableId={`list:${id}`} index={index} isDragDisabled={!isPersisted || !canEdit}>
        {({ innerRef, draggableProps, dragHandleProps }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} data-drag-scroller ref={innerRef} className={styles.innerWrapperCollapsed}>
            <div className={styles.outerWrapper}>
              <div
                {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                className={styles.headerCollapsed}
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
        <div {...draggableProps} data-drag-scroller ref={innerRef} className={styles.innerWrapper}>
          <div className={styles.outerWrapper}>
            <div
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={styles.header}
            >
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className={classNames(styles.headerCollapseButton, canEdit && styles.headerEditable)} onClick={handleToggleCollapseClick}>
                <Icon fitted name="triangle right" />
              </div>
              <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate} onClose={handleNameEditClose} onHeightChange={handleNameEditHeightChange}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div className={classNames(styles.headerName, canEdit && styles.headerEditable)} onClick={handleHeaderNameClick} ref={handleHeaderNameHeightChange}>
                  {name}
                </div>
              </NameEdit>
              {isPersisted && canEdit && (
                <ActionsPopup onNameEdit={handleNameEdit} onCardAdd={handleCardAdd} onDelete={onDelete}>
                  <Button className={classNames(styles.headerButton, styles.target)}>
                    <Icon fitted name="pencil" size="small" />
                  </Button>
                </ActionsPopup>
              )}
              <div className={styles.headerCardsCount}>{cardsCountText()}</div>
            </div>
            <div ref={listWrapper} className={styles.cardsInnerWrapper}>
              <div className={styles.cardsOuterWrapper}>{cardsNode}</div>
            </div>
            {addCardNode}
          </div>
        </div>
      )}
    </Draggable>
  );
});

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  filteredCardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
};

export default List;
