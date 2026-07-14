import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { addDays, format, startOfDay } from 'date-fns';
import PropTypes from 'prop-types';

import CardDetailPanelContainer from '../../../containers/Project/CardDetailPanelContainer';
import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';
import Timeline, { ZOOM } from '../Timeline';
import { SCHEDULE_SPAN_DAYS, shiftViewDate } from '../Timeline/timeline-utils';

import * as s from './Gantt.module.scss';

const Gantt = React.memo(({ schedulingData, onBoardFetch, onCardUpdate }) => {
  const [t] = useTranslation();

  const [zoom, setZoom] = useState(ZOOM.DAY);
  const [grouping, setGrouping] = useState('boardList');
  // Boards default to collapsed (opt-in expand) so every board is listed on screen without
  // scrolling past thousands of cards; lists inside an expanded board default to open.
  const [expandedBoards, setExpandedBoards] = useState(() => new Set());
  const [collapsedLists, setCollapsedLists] = useState(() => new Set());
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [markerDate, setMarkerDate] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const requestedBoardsRef = useRef(new Set());

  const boards = useMemo(() => (schedulingData ? schedulingData.boards : []), [schedulingData]);

  // Ensure every accessible board's cards are loaded into the ORM.
  useEffect(() => {
    boards.forEach((board) => {
      if (!board.isLoaded && !requestedBoardsRef.current.has(board.id)) {
        requestedBoardsRef.current.add(board.id);
        onBoardFetch(board.id);
      }
    });
  }, [boards, onBoardFetch]);

  const toggleBoardExpanded = useCallback((id) => {
    setExpandedBoards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleListCollapsed = useCallback((id) => {
    setCollapsedLists((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleBarClick = useCallback((cardId, canEdit, color) => {
    setSelectedCard({ id: cardId, canEdit, color });
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const handleReschedule = useCallback(
    (cardId, data) => {
      onCardUpdate(cardId, data);
    },
    [onCardUpdate],
  );

  const handleScheduleFromTray = useCallback(
    (cardId, explicitDate) => {
      const base = explicitDate || markerDate || startOfDay(new Date());
      onCardUpdate(cardId, { startDate: base, dueDate: addDays(base, SCHEDULE_SPAN_DAYS) });
    },
    [markerDate, onCardUpdate],
  );

  const toBar = useCallback(
    (card) => ({
      id: `card:${card.id}`,
      cardId: card.id,
      name: card.name,
      startDate: card.startDate,
      dueDate: card.dueDate,
      color: card.color,
      canEdit: card.canEdit,
      boardId: card.boardId,
      boardName: card.boardName,
      listName: card.listName,
    }),
    [],
  );

  const isScheduled = (card) => card.startDate || card.dueDate;

  const { rows, unscheduledBars } = useMemo(() => {
    const resultRows = [];
    const tray = [];

    if (grouping === 'none') {
      boards.forEach((board) => {
        board.lists.forEach((list) => {
          list.cards.forEach((card) => {
            if (isScheduled(card)) {
              resultRows.push({ id: `card:${card.id}`, label: card.name, indent: 0, bars: [toBar(card)] });
            } else {
              tray.push(toBar(card));
            }
          });
        });
      });
      return { rows: resultRows, unscheduledBars: tray };
    }

    boards.forEach((board) => {
      const boardRowId = `board:${board.id}`;
      const boardCollapsed = !expandedBoards.has(boardRowId);
      resultRows.push({ id: boardRowId, label: board.name, isGroup: true, indent: 0, isCollapsed: boardCollapsed, onToggleCollapse: () => toggleBoardExpanded(boardRowId) });

      if (boardCollapsed) {
        board.lists.forEach((list) => list.cards.forEach((card) => !isScheduled(card) && tray.push(toBar(card))));
        return;
      }

      board.lists.forEach((list) => {
        const listRowId = `list:${board.id}:${list.id}`;
        const listCollapsed = collapsedLists.has(listRowId);
        const scheduledCards = list.cards.filter(isScheduled);

        resultRows.push({ id: listRowId, label: list.name, isGroup: true, indent: 1, isCollapsed: listCollapsed, onToggleCollapse: () => toggleListCollapsed(listRowId) });

        if (!listCollapsed) {
          scheduledCards.forEach((card) => {
            resultRows.push({ id: `card:${card.id}`, label: card.name, indent: 2, bars: [toBar(card)] });
          });
        }

        list.cards.forEach((card) => !isScheduled(card) && tray.push(toBar(card)));
      });
    });

    return { rows: resultRows, unscheduledBars: tray };
  }, [boards, grouping, expandedBoards, collapsedLists, toggleBoardExpanded, toggleListCollapsed, toBar]);

  const renderZoomButton = (value, label) => (
    <Button style={ButtonStyle.NoBackground} className={clsx(s.zoomButton, zoom === value && s.zoomButtonActive)} onClick={() => setZoom(value)}>
      {label}
    </Button>
  );

  if (!schedulingData) {
    return (
      <div className={s.wrapper}>
        <ProjectNavContainer />
        <div className={s.empty}>{t('common.projectNotFound', { context: 'title' })}</div>
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <ProjectNavContainer />
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>{t('common.gantt')}</h1>
        <p className={s.pageDescription}>{t('common.ganttDescription')}</p>
      </div>
      <div className={s.toolbar}>
        <div className={s.zoomGroup}>
          {renderZoomButton(ZOOM.DAY, t('common.day'))}
          {renderZoomButton(ZOOM.WEEK, t('common.week'))}
          {renderZoomButton(ZOOM.MONTH, t('common.month'))}
        </div>
        <div className={s.navGroup}>
          <Button style={ButtonStyle.Icon} title={t('action.previousPeriod')} onClick={() => setViewDate((d) => shiftViewDate(d, zoom, -1))}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} />
          </Button>
          <Button style={ButtonStyle.NoBackground} className={s.todayButton} onClick={() => setViewDate(startOfDay(new Date()))}>
            {t('action.today')}
          </Button>
          <Button style={ButtonStyle.Icon} title={t('action.nextPeriod')} onClick={() => setViewDate((d) => shiftViewDate(d, zoom, 1))}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={s.iconFlipped} />
          </Button>
          <span className={s.periodLabel}>{format(viewDate, 'MMMM yyyy')}</span>
        </div>
        <Button style={ButtonStyle.NoBackground} className={clsx(s.toolButton, grouping === 'none' && s.toolButtonActive)} onClick={() => setGrouping(grouping === 'none' ? 'boardList' : 'none')}>
          {grouping === 'none' ? t('common.flat') : t('common.grouped')}
        </Button>
        <div className={s.spacer} />
      </div>
      <div className={s.content}>
        <Timeline
          rows={rows}
          zoom={zoom}
          viewDate={viewDate}
          markerDate={markerDate}
          unscheduledBars={unscheduledBars}
          emptyText={t('common.noScheduledCards')}
          selectedCardId={selectedCard ? selectedCard.id : undefined}
          onBarClick={handleBarClick}
          onBarReschedule={handleReschedule}
          onScheduleFromTray={handleScheduleFromTray}
          onMarkerSet={setMarkerDate}
        />
        {selectedCard && <CardDetailPanelContainer cardId={selectedCard.id} canEdit={selectedCard.canEdit} color={selectedCard.color} onClose={handlePanelClose} />}
      </div>
    </div>
  );
});

Gantt.propTypes = {
  schedulingData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onBoardFetch: PropTypes.func.isRequired,
  onCardUpdate: PropTypes.func.isRequired,
};

Gantt.defaultProps = {
  schedulingData: null,
};

export default Gantt;
