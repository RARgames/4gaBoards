import React, { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { VariableSizeList } from 'react-window';
import clsx from 'clsx';
import { differenceInCalendarDays } from 'date-fns';
import PropTypes from 'prop-types';

import api from '../../api';
import DroppableTypes from '../../constants/DroppableTypes';
import { ResizeObserverSizeTypes } from '../../constants/Enums';
import CardContainer from '../../containers/CardContainer';
import DragPreviewContext from '../../contexts/DragPreviewContext';
import { useResizeObserverSize } from '../../hooks';
import { getAccessToken } from '../../utils/access-token-storage';
import CardAddPopup from '../CardAddPopup';
import { Button, ButtonStyle, Checkbox, CheckboxSize, Icon, IconType, IconSize } from '../Utils';
import ActionsPopup from './ActionsPopup';
import CardAdd from './CardAdd';
import NameEdit from './NameEdit';

import * as gs from '../../global.module.scss';
import * as s from './List.module.scss';

const ESTIMATED_CARD_HEIGHT = 96;
// Matches .warningStripe height in List.module.scss (§3.4). It's a sibling of the measured
// headerNameElement, not a child, so its height isn't picked up by the ResizeObserver and has
// to be added to headerOffset explicitly when shown.
const WARNING_STRIPE_HEIGHT = 3;
// §3.4 restyle: static (always-present) height .header's padding increase added on top of what
// --cardsInnerWrapperFullOffset/--cardsInnerWrapperOffset were originally calibrated for.
// Original vertical padding was 10+6=16px; it's now 11+9=20px (+4px). (The header/outerWrapper
// divider lines are drawn with inset box-shadow, not border, specifically so they have zero
// layout footprint and don't need to be accounted for here too.) Not picked up by the
// headerNameBlock ResizeObserver (it's outside that element), so — like WARNING_STRIPE_HEIGHT —
// it has to be added explicitly, or the virtualized list computes itself a few pixels taller
// than actually fits and a scrollbar shows up even when there's nothing to scroll.
const HEADER_CHROME_DELTA = 4;
// §6.6: synthetic (non-draggable) row heights, matching List.module.scss .groupLabel/.archiveTeaser.
const GROUP_LABEL_HEIGHT = 28;
const ARCHIVE_TEASER_HEIGHT = 62;
// Card.jsx bakes its 8px margin-bottom (CARD_GAP) into each measured row height; the drop
// preview box subtracts it back out so the dashed outline matches the card face, not the row.
const CARD_ROW_GAP = 8;
const ROW_DRAG_TRANSFORM_PROPERTY = '--list-drag-transform';
const ROW_DRAG_TRANSITION_PROPERTY = '--list-drag-transition';

const LIST_TYPE_LABEL_KEY = {
  none: 'common.listTypeNone',
  active: 'common.listTypeActive',
  blocked: 'common.listTypeBlocked',
  done: 'common.listTypeDone',
};

const DONE_GROUP_LABEL_KEY = {
  today: 'common.doneGroupToday',
  thisWeek: 'common.doneGroupEarlierThisWeek',
  older: 'common.doneGroupOlder',
};

// §6.6 bucketing rule: Today / Earlier this week (within 7 days, not today) / Older. A card
// without completedAt (shouldn't normally happen inside a done-type list) falls back to Older.
function getDoneGroupBucket(completedAt) {
  if (!completedAt) {
    return 'older';
  }
  const daysAgo = differenceInCalendarDays(new Date(), completedAt);
  if (daysAgo <= 0) {
    return 'today';
  }
  if (daysAgo < 7) {
    return 'thisWeek';
  }
  return 'older';
}

// Builds the virtualized row list. For non-`done` lists this degenerates to exactly one 'card'
// row per filtered card (row-space === card-space, identical to before this feature existed).
// For `done` lists, group-label and archive-teaser rows are interleaved as separate row-space
// entries that are never wrapped in <Draggable> — react-beautiful-dnd only ever sees the 'card'
// rows (via their untouched, card-space `cardIndex`), so its own destination-index math needs
// no special-casing for the extra rows.
function buildRowItems(filteredCardIds, type, completedAtByCardId) {
  if (type !== 'done') {
    return filteredCardIds.map((cardId, cardIndex) => ({ rowType: 'card', key: cardId, cardId, cardIndex }));
  }

  const rows = [];
  let prevBucket = null;
  // The label row owns the ids of the cards under it, so its select-all checkbox doesn't have
  // to re-derive the bucketing that this loop is already doing.
  let labelRow = null;
  filteredCardIds.forEach((cardId, cardIndex) => {
    const bucket = getDoneGroupBucket(completedAtByCardId ? completedAtByCardId[cardId] : null);
    if (bucket !== prevBucket) {
      labelRow = { rowType: 'label', key: `label:${bucket}`, bucket, cardIds: [] };
      rows.push(labelRow);
      prevBucket = bucket;
    }
    labelRow.cardIds.push(cardId);
    rows.push({ rowType: 'card', key: cardId, cardId, cardIndex });
  });
  rows.push({ rowType: 'teaser', key: 'archive-teaser' });

  return rows;
}

function buildSameListPreviewRowItems(filteredCardIds, draggedCardId, destinationIndex, type, completedAtByCardId, previewHeight) {
  const remainingCardIds = filteredCardIds.filter((cardId) => cardId !== draggedCardId);
  const finalCardIds = [...remainingCardIds];
  finalCardIds.splice(Math.min(destinationIndex, finalCardIds.length), 0, draggedCardId);

  if (type !== 'done') {
    return finalCardIds.map((cardId) =>
      cardId === draggedCardId ? { rowType: 'preview', key: 'same-list-drop-preview', height: previewHeight } : { rowType: 'card', key: cardId, cardId, cardIndex: filteredCardIds.indexOf(cardId) },
    );
  }

  const rows = [];
  let prevBucket = null;
  let labelRow = null;
  finalCardIds.forEach((cardId) => {
    const bucket = getDoneGroupBucket(completedAtByCardId ? completedAtByCardId[cardId] : null);
    if (bucket !== prevBucket) {
      labelRow = { rowType: 'label', key: `label:${bucket}`, bucket, cardIds: [] };
      rows.push(labelRow);
      prevBucket = bucket;
    }
    labelRow.cardIds.push(cardId);
    if (cardId === draggedCardId) {
      rows.push({ rowType: 'preview', key: 'same-list-drop-preview', height: previewHeight });
    } else {
      rows.push({ rowType: 'card', key: cardId, cardId, cardIndex: filteredCardIds.indexOf(cardId) });
    }
  });
  rows.push({ rowType: 'teaser', key: 'archive-teaser' });

  return rows;
}

function CardRow({ data, index, style }) {
  const item = data.rowItems[index];
  if (!item) {
    return null;
  }

  const rowStyle = data.getRowStyle ? data.getRowStyle(item, style) : style;

  if (item.rowType === 'label') {
    const groupCardIds = item.cardIds || [];
    const selectedCardIds = data.selectedCardIds || [];
    const isAllSelected = groupCardIds.length > 0 && groupCardIds.every((cardId) => selectedCardIds.includes(cardId));
    const isSomeSelected = groupCardIds.some((cardId) => selectedCardIds.includes(cardId));

    return (
      <div style={rowStyle} className={s.groupLabel}>
        {/* Select-all for this bucket. Contextual, same as the column-level one. */}
        {data.canEdit && data.isSelectionActive && (
          <Checkbox
            size={CheckboxSize.Size14}
            checked={isAllSelected}
            disabled={groupCardIds.length === 0}
            title={data.t(isAllSelected ? 'common.deselectAllCardsInGroup' : 'common.selectAllCardsInGroup')}
            className={s.groupLabelCheckbox}
            ref={(element) => {
              if (element) {
                // eslint-disable-next-line no-param-reassign
                element.indeterminate = isSomeSelected && !isAllSelected;
              }
            }}
            onChange={() => data.onGroupSelectToggle(groupCardIds)}
          />
        )}
        {data.t(DONE_GROUP_LABEL_KEY[item.bucket])}
      </div>
    );
  }

  if (item.rowType === 'teaser') {
    return (
      <div style={rowStyle} className={s.archiveTeaserWrapper}>
        <button type="button" className={s.archiveTeaser} onClick={data.onArchiveViewOpen}>
          {data.archiveStats ? data.t('common.viewFullArchive', { count: data.archiveStats.total, month: data.archiveStats.newestArchivedMonth }) : data.t('common.viewFullArchiveShort')}
        </button>
      </div>
    );
  }

  if (item.rowType === 'preview') {
    return <div style={rowStyle} className={s.sameListDropPreview} />;
  }

  return <CardContainer id={item.cardId} index={item.cardIndex} style={rowStyle} onSizeChange={data.onSizeChange} />;
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
    boardId,
    name,
    isPersisted,
    isCollapsed,
    type,
    wipLimit,
    autoArchiveDays,
    cardIds,
    isFiltered,
    filteredCardIds,
    completedAtByCardId,
    labelIds,
    memberIds,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    isSelectionActive,
    isAllCardsSelected,
    isSomeCardsSelected,
    selectedCardIds,
    onUpdate,
    onDelete,
    onCardCreate,
    onSelectAllToggle,
    onGroupSelectToggle,
    onArchiveViewOpen,
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
    const [archiveStats, setArchiveStats] = useState(null);

    const styleVars = useMemo(() => {
      const computedStyle = getComputedStyle(document.body);
      return {
        cardsInnerWrapperFullOffset: parseInt(computedStyle.getPropertyValue('--cardsInnerWrapperFullOffset'), 10),
        cardsInnerWrapperOffset: parseInt(computedStyle.getPropertyValue('--cardsInnerWrapperOffset'), 10),
        headerNameDefaultHeight: parseInt(computedStyle.getPropertyValue('--headerNameDefaultHeight'), 10),
      };
    }, []);

    // List type indicator (§6.1): caption text + warning stripe, derived from `type`/`wipLimit`/
    // `autoArchiveDays`. `none` renders neither. Cheap to recompute every render, no memo needed.
    const isOverWipLimit = type === 'active' && !!wipLimit && cardIds.length > wipLimit;
    const showWarningStripe = type === 'blocked' || isOverWipLimit;

    let listTypeCaption = null;
    if (type === 'active' && wipLimit) {
      listTypeCaption = t('common.wipCountOfLimit', { count: cardIds.length, limit: wipLimit });
    } else if (type === 'blocked') {
      listTypeCaption = t('common.listFlagsCardsAsStuck');
    } else if (type === 'done') {
      listTypeCaption = t('common.autoArchivesAfterDays', { days: autoArchiveDays });
    }

    // §6.6 archive-teaser row: fetches the board-wide archived-card total + newest fully-archived
    // month once for the teaser's copy. Same on-demand-fetch pattern as CardLinks/LinkAdder
    // (plain useEffect + api call, no Redux action) — this is read-only, low-frequency data.
    useEffect(() => {
      if (type !== 'done' || !boardId) {
        return undefined;
      }
      let cancelled = false;
      api
        .getBoardArchivedCards(boardId, { Authorization: `Bearer ${getAccessToken()}` })
        .then((res) => {
          if (cancelled) return;
          setArchiveStats({ total: res.total, newestArchivedMonth: res.newestArchivedMonth });
        })
        .catch((error) => {
          if (cancelled) return;
          // eslint-disable-next-line no-console
          console.error(`Failed to load archive stats for board ${boardId}:`, error);
          setArchiveStats(null);
        });
      return () => {
        cancelled = true;
      };
    }, [type, boardId]);

    const handleToggleCollapseClick = useCallback(() => {
      if (isPersisted && canEdit) {
        onUpdate({
          isCollapsed: !isCollapsed,
        });
      }
    }, [isPersisted, canEdit, onUpdate, isCollapsed]);

    const handleSelectAllChange = useCallback(() => {
      onSelectAllToggle?.();
    }, [onSelectAllToggle]);

    // "Some but not all selected" is an indeterminate checkbox, which has no JSX attribute —
    // it can only be set on the DOM node.
    const selectAllCheckbox = useRef(null);
    const setSelectAllCheckboxElement = useCallback((element) => {
      selectAllCheckbox.current = element;
    }, []);

    useEffect(() => {
      if (selectAllCheckbox.current) {
        selectAllCheckbox.current.indeterminate = isSomeCardsSelected && !isAllCardsSelected;
      }
    }, [isSomeCardsSelected, isAllCardsSelected, isSelectionActive]);

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

    // §6.6: row-space (what VariableSizeList iterates: cards + interleaved label/teaser rows for
    // `done` lists) vs. card-space (filteredCardIds order, what react-beautiful-dnd's Draggable
    // `index` and destination math use). For every non-`done` list these two spaces are identical
    // — buildRowItems degenerates to one 'card' row per filtered card, unchanged from before.
    // During a same-list hover we own the row layout explicitly: the dragged card becomes a
    // preview row at the destination, and the real source card is omitted. When the card leaves
    // the source list's valid hover area, we still omit it so the remaining cards stack normally.
    const dragPreview = useContext(DragPreviewContext);

    const isHomeListDrag = dragPreview && dragPreview.source && dragPreview.source.droppableId === `list:${id}`;
    const isSameListPreview = isHomeListDrag && dragPreview.destination && dragPreview.destination.droppableId === `list:${id}`;
    const draggedCardId = dragPreview ? dragPreview.draggableId.split(':')[1] : null;
    const draggedRowHeight = dragPreview && dragPreview.cardHeight != null ? dragPreview.cardHeight + CARD_ROW_GAP : ESTIMATED_CARD_HEIGHT;

    const rowItems = useMemo(() => {
      if (isSameListPreview && draggedCardId) {
        return buildSameListPreviewRowItems(filteredCardIds, draggedCardId, dragPreview.destination.index, type, completedAtByCardId, draggedRowHeight);
      }
      if (isHomeListDrag && draggedCardId) {
        return buildRowItems(
          filteredCardIds.filter((cardId) => cardId !== draggedCardId),
          type,
          completedAtByCardId,
        );
      }
      return buildRowItems(filteredCardIds, type, completedAtByCardId);
    }, [filteredCardIds, type, completedAtByCardId, isSameListPreview, draggedCardId, dragPreview, draggedRowHeight, isHomeListDrag]);

    const rowIndexByCardId = useMemo(() => {
      const map = {};
      rowItems.forEach((item, rowIndex) => {
        if (item.rowType === 'card') {
          map[item.cardId] = rowIndex;
        }
      });
      return map;
    }, [rowItems]);

    useEffect(() => {
      if (isAddCardOpen && listRef.current) {
        if (addCardAtTop) {
          listRef.current.scrollToItem(0);
        } else if (filteredCardIds.length > 0) {
          const lastCardId = filteredCardIds[filteredCardIds.length - 1];
          listRef.current.scrollToItem(rowIndexByCardId[lastCardId] ?? rowItems.length - 1);
        }
      }
    }, [filteredCardIds, rowItems, rowIndexByCardId, isAddCardOpen, addCardAtTop]);

    useEffect(() => {
      const handleResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // react-window caches each row's height by index. When the row set or order changes
    // (delete, reorder, filter, socket update, or — for `done` lists — a completedAt bucket
    // shifting a card between group-label sections) those indices remap, so the cache must be
    // invalidated here or rows render at stale heights and overlap. A card resizing itself is
    // already handled by setCardSize below.
    const prevRowKeysRef = useRef(rowItems.map((item) => item.key));
    useEffect(() => {
      const prev = prevRowKeysRef.current;
      const nextKeys = rowItems.map((item) => item.key);
      const isSame = prev.length === nextKeys.length && prev.every((key, rowIndex) => key === nextKeys[rowIndex]);
      if (!isSame) {
        prevRowKeysRef.current = nextKeys;
        listRef.current?.resetAfterIndex(0);
      }
    }, [rowItems]);

    const setCardSize = useCallback(
      (cardId, size) => {
        if (sizeMap.current[cardId] === size) {
          return;
        }
        sizeMap.current[cardId] = size;
        const rowIndex = rowIndexByCardId[cardId];
        if (listRef.current && rowIndex >= 0) {
          listRef.current.resetAfterIndex(rowIndex);
        }
        setSizeVersion((version) => version + 1);
      },
      [rowIndexByCardId],
    );

    const getRowSize = useCallback(
      (rowIndex) => {
        const item = rowItems[rowIndex];
        if (!item) {
          return dragPreview && dragPreview.cardHeight != null ? dragPreview.cardHeight + CARD_ROW_GAP : ESTIMATED_CARD_HEIGHT;
        }
        if (item.rowType === 'label') {
          return GROUP_LABEL_HEIGHT;
        }
        if (item.rowType === 'teaser') {
          return ARCHIVE_TEASER_HEIGHT;
        }
        if (item.rowType === 'preview') {
          return item.height;
        }
        return sizeMap.current[item.cardId] || ESTIMATED_CARD_HEIGHT;
      },
      [rowItems, dragPreview],
    );

    const getRowKey = useCallback((rowIndex) => rowItems[rowIndex]?.key ?? rowIndex, [rowItems]);

    const rowBoundaryByKey = useMemo(() => {
      const map = {};
      rowItems.forEach((item, rowIndex) => {
        if (item.rowType === 'card') {
          map[item.key] = item.cardIndex;
          return;
        }

        if (item.rowType === 'label') {
          const nextCard = rowItems.slice(rowIndex + 1).find((nextItem) => nextItem.rowType === 'card');
          map[item.key] = nextCard ? nextCard.cardIndex : filteredCardIds.length;
          return;
        }

        if (item.rowType === 'teaser') {
          map[item.key] = filteredCardIds.length;
        }
      });
      return map;
    }, [rowItems, filteredCardIds.length]);

    const getRowDisplacement = useCallback(
      (item) => {
        if (!dragPreview || !dragPreview.source) {
          return 0;
        }

        const currentDroppableId = `list:${id}`;
        const isSourceList = dragPreview.source.droppableId === currentDroppableId;
        const isDestinationList = dragPreview.destination && dragPreview.destination.droppableId === currentDroppableId;
        if (!isSourceList && !isDestinationList) {
          return 0;
        }

        const [, activeDraggedCardId] = dragPreview.draggableId.split(':');
        const activeDraggedRowHeight = (isSourceList && sizeMap.current[activeDraggedCardId]) || (dragPreview.cardHeight != null ? dragPreview.cardHeight + CARD_ROW_GAP : ESTIMATED_CARD_HEIGHT);
        const rowBoundary = rowBoundaryByKey[item.key];
        if (rowBoundary === undefined) {
          return 0;
        }

        if (isSourceList && isDestinationList) {
          const sourceIndex = dragPreview.source.index;
          const destinationIndex = dragPreview.destination.index;
          if (item.rowType === 'card') {
            return 0;
          }
          if (destinationIndex > sourceIndex && rowBoundary > sourceIndex && rowBoundary <= destinationIndex) {
            return -activeDraggedRowHeight;
          }
          if (destinationIndex < sourceIndex) {
            const isAfterDestination = item.rowType === 'label' ? rowBoundary > destinationIndex : rowBoundary >= destinationIndex;
            if (isAfterDestination && rowBoundary < sourceIndex) {
              return activeDraggedRowHeight;
            }
          }
          return 0;
        }

        if (item.rowType === 'card') {
          return 0;
        }

        if (isSourceList) {
          return rowBoundary > dragPreview.source.index ? -activeDraggedRowHeight : 0;
        }

        const isAfterDestination = item.rowType === 'label' ? rowBoundary > dragPreview.destination.index : rowBoundary >= dragPreview.destination.index;
        return isAfterDestination ? activeDraggedRowHeight : 0;
      },
      [dragPreview, id, rowBoundaryByKey],
    );

    const getRowStyle = useCallback(
      (item, style) => {
        const displacement = getRowDisplacement(item);

        if (item.rowType === 'card' && isSameListPreview) {
          return {
            ...style,
            [ROW_DRAG_TRANSFORM_PROPERTY]: displacement ? `translateY(${displacement}px)` : 'translateY(0px)',
            [ROW_DRAG_TRANSITION_PROPERTY]: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
          };
        }

        if (!displacement) {
          return style;
        }

        return {
          ...style,
          transform: `translateY(${displacement}px)`,
          transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        };
      },
      [getRowDisplacement, isSameListPreview],
    );

    const cardsItemData = useMemo(
      () => ({ rowItems, onSizeChange: setCardSize, t, archiveStats, onArchiveViewOpen, getRowStyle, canEdit, isSelectionActive, selectedCardIds, onGroupSelectToggle }),
      [rowItems, setCardSize, t, archiveStats, onArchiveViewOpen, getRowStyle, canEdit, isSelectionActive, selectedCardIds, onGroupSelectToggle],
    );

    const wrapperOffset = (isAddCardOpen || !canEdit ? styleVars.cardsInnerWrapperFullOffset : styleVars.cardsInnerWrapperOffset) + HEADER_CHROME_DELTA;
    const headerOffset = (nameEditHeight || headerNameHeight) + (showWarningStripe ? WARNING_STRIPE_HEIGHT : 0);
    const availableHeight = Math.max(windowHeight - wrapperOffset - (headerOffset - styleVars.headerNameDefaultHeight), ESTIMATED_CARD_HEIGHT);
    const totalCardsHeight = useMemo(
      () => rowItems.reduce((acc, item, rowIndex) => acc + getRowSize(rowIndex), 0),
      [rowItems, sizeVersion], // eslint-disable-line react-hooks/exhaustive-deps
    );
    // react-window's outer element defaults to overflow:auto, which makes scrollbars appear
    // whenever content exceeds listHeight by even 1px — and listHeight is computed to EXACTLY
    // equal content height when the list fits, so any sub-pixel/rounding mismatch (measured
    // offsetHeight is an integer; real layout heights aren't) produced permanent phantom
    // scrollbars, with the vertical one then eating 8px of width and triggering the horizontal
    // one too. State the intent directly instead: vertical scrolling only when the cards
    // genuinely exceed the available height; horizontal scrolling never. VariableSizeList
    // merges this `style` onto the outer element after its defaults, so these values win.
    const getListStyle = useCallback((height) => ({ overflowX: 'hidden', overflowY: height > availableHeight ? 'auto' : 'hidden' }), [availableHeight]);

    // §6.7 drop preview, overlay edition. react-beautiful-dnd already opens a gap at the
    // destination by translating the rendered cards (it does this in virtual mode too) — so the
    // preview's only job is to DRAW the dashed box inside that gap, without touching layout.
    // This computes where the gap sits in this list's original (untranslated) row layout:
    //  - same-list, dragging down: cards between source+1..dest shift UP by the dragged row's
    //    height, so the gap is at dest's original bottom edge minus that height;
    //  - same-list dragging up, and cross-list: cards from dest shift DOWN, gap at dest's top;
    //  - cross-list past the last card: gap right after the last card row.
    // Scroll position comes from the virtualizer's own onScroll, so auto-scroll during a drag
    // keeps the overlay glued to the gap.
    const [scrollOffset, setScrollOffset] = useState(0);
    const handleListScroll = useCallback(({ scrollOffset: nextScrollOffset }) => setScrollOffset(nextScrollOffset), []);

    const dropPreviewBox = useMemo(() => {
      if (!dragPreview || !dragPreview.destination || dragPreview.destination.droppableId !== `list:${id}`) {
        return null;
      }

      const [, previewDraggedCardId] = dragPreview.draggableId.split(':');
      const isSameList = dragPreview.source && dragPreview.source.droppableId === `list:${id}`;
      if (isSameList) {
        return null;
      }
      // Same-list: the dragged card's row height from this list's own measurements. Cross-list:
      // the height Board.jsx measured off the card's DOM node at drag start (+ the row gap).
      const previewDraggedRowHeight = (isSameList && sizeMap.current[previewDraggedCardId]) || (dragPreview.cardHeight != null ? dragPreview.cardHeight + CARD_ROW_GAP : ESTIMATED_CARD_HEIGHT);

      const cardRowIndexes = [];
      rowItems.forEach((item, rowIndex) => {
        if (item.rowType === 'card') {
          cardRowIndexes[item.cardIndex] = rowIndex;
        }
      });

      const offsetOfRow = (rowIndex) => {
        let offset = 0;
        for (let i = 0; i < rowIndex; i += 1) {
          offset += getRowSize(i);
        }
        return offset;
      };

      const destIndex = dragPreview.destination.index;
      let gapTop;
      if (isSameList && destIndex > dragPreview.source.index) {
        const destRow = cardRowIndexes[destIndex];
        if (destRow === undefined) {
          return null;
        }
        gapTop = offsetOfRow(destRow) + getRowSize(destRow) - previewDraggedRowHeight;
      } else if (destIndex < filteredCardIds.length) {
        const destRow = cardRowIndexes[destIndex];
        if (destRow === undefined) {
          return null;
        }
        gapTop = offsetOfRow(destRow);
      } else {
        const lastCardRow = cardRowIndexes[filteredCardIds.length - 1];
        gapTop = lastCardRow === undefined ? 0 : offsetOfRow(lastCardRow) + getRowSize(lastCardRow);
      }

      return {
        top: gapTop - scrollOffset,
        height: Math.max(0, previewDraggedRowHeight - CARD_ROW_GAP),
      };
    }, [dragPreview, id, rowItems, getRowSize, filteredCardIds, scrollOffset]);

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
        {(droppableProvided, droppableSnapshot) => {
          const shouldRenderVirtualPlaceholder = droppableSnapshot.isUsingPlaceholder && !isHomeListDrag;
          const placeholderHeight = shouldRenderVirtualPlaceholder ? getRowSize(rowItems.length) : 0;
          const visibleTotalCardsHeight = totalCardsHeight + placeholderHeight;
          const visibleListHeight = Math.min(visibleTotalCardsHeight, availableHeight) || 1;

          return (
            <div className={s.cardsListWrapper}>
              <VariableSizeList
                ref={listRef}
                outerRef={droppableProvided.innerRef}
                className={s.cards}
                style={getListStyle(visibleTotalCardsHeight)}
                width="100%"
                height={visibleListHeight}
                itemCount={rowItems.length + (shouldRenderVirtualPlaceholder ? 1 : 0)}
                itemSize={getRowSize}
                itemKey={getRowKey}
                itemData={cardsItemData}
                estimatedItemSize={ESTIMATED_CARD_HEIGHT}
                overscanCount={3}
                onScroll={handleListScroll}
              >
                {CardRow}
              </VariableSizeList>
              {dropPreviewBox && <div className={s.dropPreviewOverlay} style={{ top: dropPreviewBox.top, height: dropPreviewBox.height }} />}
            </div>
          );
        }}
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
                {/*
                  Select-all for the column. Only rendered once a multi-selection is under way,
                  so a board that isn't being multi-selected keeps exactly the header it had —
                  the same action is always reachable from the list's ⋮ menu below.
                */}
                {canEdit && isSelectionActive && onSelectAllToggle && (
                  <Checkbox
                    size={CheckboxSize.Size14}
                    checked={isAllCardsSelected}
                    disabled={filteredCardIds.length === 0}
                    title={t(isAllCardsSelected ? 'common.deselectAllCardsInList' : 'common.selectAllCardsInList')}
                    className={s.headerSelectCheckbox}
                    ref={setSelectAllCheckboxElement}
                    onChange={handleSelectAllChange}
                  />
                )}
                {/*
                  headerNameBlock carries the ResizeObserver ref (moved off .headerName) so the
                  optional caption row's height is picked up by the existing dynamic
                  headerOffset math (List.jsx `headerOffset`/`availableHeight`) automatically —
                  no static CSS-constant recalibration needed for the common type=none case.
                */}
                <div className={s.headerNameBlock} ref={setHeaderNameElement}>
                  <div className={s.headerTitleRow}>
                    <span className={clsx(s.typeDot, s[`typeDot-${type}`])} title={t(LIST_TYPE_LABEL_KEY[type])} />
                    <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate} onClose={handleNameEditClose} onHeightChange={handleNameEditHeightChange}>
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <div className={clsx(s.headerName, canEdit && gs.cursorPointer)} onClick={handleHeaderNameClick} title={name}>
                        {name}
                      </div>
                    </NameEdit>
                  </div>
                  {listTypeCaption && <div className={clsx(s.headerCaption, gs.fontMono, isOverWipLimit && s.headerCaptionWarning)}>{listTypeCaption}</div>}
                </div>
                {/*
                  Adds to the TOP of the column — handleCardAdd is the same "add at top" entry
                  point the list's ⋮ menu uses; the bottom .addCardButton appends instead.
                */}
                {isPersisted && canEdit && (
                  <Button style={ButtonStyle.Icon} title={t('common.addCardToTop')} onClick={handleCardAdd} className={s.headerAddCardButton}>
                    <Icon type={IconType.PlusMath} size={IconSize.Size13} />
                  </Button>
                )}
                {isPersisted && canEdit && (
                  <div className={s.popupWrapper}>
                    <ActionsPopup
                      name={name}
                      type={type}
                      wipLimit={wipLimit}
                      autoArchiveDays={autoArchiveDays}
                      createdAt={createdAt}
                      createdBy={createdBy}
                      updatedAt={updatedAt}
                      updatedBy={updatedBy}
                      boardMemberships={boardMemberships}
                      hasCards={filteredCardIds.length > 0}
                      isAllCardsSelected={isAllCardsSelected}
                      onNameEdit={handleNameEdit}
                      onCardAdd={handleCardAdd}
                      onSelectAllToggle={onSelectAllToggle}
                      onDelete={onDelete}
                      onTypeUpdate={onUpdate}
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
                <div className={clsx(s.headerCardsCount, gs.fontMono)}>{cardsCountText()}</div>
              </div>
              {showWarningStripe && <div className={s.warningStripe} />}
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
  boardId: PropTypes.string,
  name: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['none', 'active', 'blocked', 'done']).isRequired,
  wipLimit: PropTypes.number,
  autoArchiveDays: PropTypes.number,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  filteredCardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  completedAtByCardId: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isSelectionActive: PropTypes.bool,
  isAllCardsSelected: PropTypes.bool,
  isSomeCardsSelected: PropTypes.bool,
  selectedCardIds: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
  onSelectAllToggle: PropTypes.func,
  onGroupSelectToggle: PropTypes.func,
  onArchiveViewOpen: PropTypes.func,
};

List.defaultProps = {
  isSelectionActive: false,
  isAllCardsSelected: false,
  isSomeCardsSelected: false,
  selectedCardIds: undefined,
  onSelectAllToggle: undefined,
  onGroupSelectToggle: undefined,
  boardId: undefined,
  wipLimit: undefined,
  autoArchiveDays: undefined,
  completedAtByCardId: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  onArchiveViewOpen: undefined,
};

export default List;
