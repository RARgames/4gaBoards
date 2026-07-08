import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, format, startOfDay } from 'date-fns';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import CardDetailPanelContainer from '../../../containers/Project/CardDetailPanelContainer';
import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../../Utils';
import Timeline, { ZOOM } from '../Timeline';
import { SCHEDULE_SPAN_DAYS, shiftViewDate } from '../Timeline/timeline-utils';

import * as s from './Gantt.module.scss';

const ALL_BOARDS = { id: 'all', name: null };

const Gantt = React.memo(({ projectId, schedulingData, chartViews, canManageViews, onBoardFetch, onCardUpdate, onChartViewsFetch, onChartViewCreate, onChartViewUpdate, onChartViewDelete }) => {
  const [t] = useTranslation();

  const [zoom, setZoom] = useState(ZOOM.DAY);
  const [grouping, setGrouping] = useState('boardList');
  const [showDependencies, setShowDependencies] = useState(true);
  const [boardFilter, setBoardFilter] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [activeViewId, setActiveViewId] = useState(null);
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [markerDate, setMarkerDate] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const requestedBoardsRef = useRef(new Set());

  const boards = useMemo(() => (schedulingData ? schedulingData.boards : []), [schedulingData]);

  useEffect(() => {
    onChartViewsFetch(projectId);
  }, [projectId, onChartViewsFetch]);

  // Ensure every accessible board's cards are loaded into the ORM.
  useEffect(() => {
    boards.forEach((board) => {
      if (!board.isLoaded && !requestedBoardsRef.current.has(board.id)) {
        requestedBoardsRef.current.add(board.id);
        onBoardFetch(board.id);
      }
    });
  }, [boards, onBoardFetch]);

  const toggleCollapse = useCallback((id) => {
    setCollapsed((prev) => {
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

  const visibleBoards = useMemo(() => (boardFilter ? boards.filter((b) => b.id === boardFilter) : boards), [boards, boardFilter]);

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
      visibleBoards.forEach((board) => {
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

    visibleBoards.forEach((board) => {
      const boardRowId = `board:${board.id}`;
      const boardCollapsed = collapsed.has(boardRowId);
      resultRows.push({ id: boardRowId, label: board.name, isGroup: true, indent: 0, isCollapsed: boardCollapsed, onToggleCollapse: () => toggleCollapse(boardRowId) });

      if (boardCollapsed) {
        board.lists.forEach((list) => list.cards.forEach((card) => !isScheduled(card) && tray.push(toBar(card))));
        return;
      }

      board.lists.forEach((list) => {
        const listRowId = `list:${board.id}:${list.id}`;
        const listCollapsed = collapsed.has(listRowId);
        const scheduledCards = list.cards.filter(isScheduled);

        resultRows.push({ id: listRowId, label: list.name, isGroup: true, indent: 1, isCollapsed: listCollapsed, onToggleCollapse: () => toggleCollapse(listRowId) });

        if (!listCollapsed) {
          scheduledCards.forEach((card) => {
            resultRows.push({ id: `card:${card.id}`, label: card.name, indent: 2, bars: [toBar(card)] });
          });
        }

        list.cards.forEach((card) => !isScheduled(card) && tray.push(toBar(card)));
      });
    });

    return { rows: resultRows, unscheduledBars: tray };
  }, [visibleBoards, grouping, collapsed, toggleCollapse, toBar]);

  const dependencies = schedulingData ? schedulingData.dependencies : [];

  const handleApplyView = useCallback((view) => {
    setActiveViewId(view.id);
    const config = view.config || {};
    if (config.zoom) {
      setZoom(config.zoom);
    }
    if (config.grouping) {
      setGrouping(config.grouping);
    }
    setShowDependencies(config.showDependencies !== false);
    setBoardFilter(config.boardId || null);
  }, []);

  const handleSaveView = useCallback(() => {
    const name = t('common.ganttView', { number: chartViews.length + 1 });
    onChartViewCreate(projectId, {
      type: 'gantt',
      name,
      position: (chartViews.length + 1) * 65535,
      config: { zoom, grouping, showDependencies, boardId: boardFilter },
    });
  }, [t, chartViews.length, onChartViewCreate, projectId, zoom, grouping, showDependencies, boardFilter]);

  const handleUpdateActiveView = useCallback(() => {
    if (activeViewId) {
      onChartViewUpdate(activeViewId, { config: { zoom, grouping, showDependencies, boardId: boardFilter } });
    }
  }, [activeViewId, onChartViewUpdate, zoom, grouping, showDependencies, boardFilter]);

  const handleDeleteActiveView = useCallback(() => {
    if (activeViewId) {
      onChartViewDelete(activeViewId);
      setActiveViewId(null);
    }
  }, [activeViewId, onChartViewDelete]);

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

  const boardOptions = [ALL_BOARDS, ...boards.map((b) => ({ id: b.id, name: b.name }))];
  const viewOptions = chartViews.map((v) => ({ id: v.id, name: v.name }));

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
        <Button style={ButtonStyle.NoBackground} className={clsx(s.toolButton, showDependencies && s.toolButtonActive)} onClick={() => setShowDependencies((v) => !v)}>
          <Icon type={IconType.Link} size={IconSize.Size14} className={s.toolIcon} />
          {t('common.dependencies')}
        </Button>
        {boards.length > 1 && (
          <Dropdown
            style={DropdownStyle.Default}
            options={boardOptions}
            defaultItem={boardFilter ? boardOptions.find((o) => o.id === boardFilter) : ALL_BOARDS}
            placeholder={t('common.allBoards')}
            onChange={(item) => setBoardFilter(item.id === ALL_BOARDS.id ? null : item.id)}
            className={s.boardDropdown}
          />
        )}
        <div className={s.spacer} />
        {viewOptions.length > 0 && (
          <Dropdown
            style={DropdownStyle.Default}
            options={viewOptions}
            defaultItem={activeViewId ? viewOptions.find((o) => o.id === activeViewId) : undefined}
            placeholder={t('common.savedViews')}
            onChange={(item) => handleApplyView(chartViews.find((v) => v.id === item.id))}
            className={s.viewDropdown}
          />
        )}
        {canManageViews && activeViewId && (
          <>
            <Button style={ButtonStyle.NoBackground} className={s.toolButton} onClick={handleUpdateActiveView}>
              {t('action.saveView')}
            </Button>
            <Button style={ButtonStyle.Icon} title={t('action.deleteView', { context: 'title' })} onClick={handleDeleteActiveView}>
              <Icon type={IconType.Trash} size={IconSize.Size13} />
            </Button>
          </>
        )}
        {canManageViews && <Button style={ButtonStyle.DefaultBorder} content={t('action.saveCurrentView')} onClick={handleSaveView} />}
      </div>
      <div className={s.content}>
        <Timeline
          rows={rows}
          zoom={zoom}
          viewDate={viewDate}
          markerDate={markerDate}
          dependencies={dependencies}
          showDependencies={showDependencies}
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
  projectId: PropTypes.string.isRequired,
  schedulingData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  chartViews: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canManageViews: PropTypes.bool.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onCardUpdate: PropTypes.func.isRequired,
  onChartViewsFetch: PropTypes.func.isRequired,
  onChartViewCreate: PropTypes.func.isRequired,
  onChartViewUpdate: PropTypes.func.isRequired,
  onChartViewDelete: PropTypes.func.isRequired,
};

Gantt.defaultProps = {
  schedulingData: null,
};

export default Gantt;
