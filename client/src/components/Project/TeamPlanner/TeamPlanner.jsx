import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, format, startOfDay } from 'date-fns';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import CardDetailPanelContainer from '../../../containers/Project/CardDetailPanelContainer';
import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import User from '../../User';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../../Utils';
import Timeline, { ZOOM } from '../Timeline';
import { SCHEDULE_SPAN_DAYS, shiftViewDate } from '../Timeline/timeline-utils';
import ReassignConfirmDialog from './ReassignConfirmDialog';

import * as s from './TeamPlanner.module.scss';

const UNASSIGNED_ROW_ID = 'unassigned';
const MEMBER_PREFIX = 'member:';

const TeamPlanner = React.memo(
  ({ projectId, schedulingData, chartViews, canManageViews, onBoardFetch, onCardUpdate, onUserAddToCard, onUserRemoveFromCard, onChartViewsFetch, onChartViewCreate, onChartViewUpdate, onChartViewDelete }) => {
    const [t] = useTranslation();

    const [zoom, setZoom] = useState(ZOOM.DAY);
    const [activeViewId, setActiveViewId] = useState(null);
    const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
    const [markerDate, setMarkerDate] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [pendingReassign, setPendingReassign] = useState(null);
    const [collapsedRows, setCollapsedRows] = useState(() => new Set());

    const requestedBoardsRef = useRef(new Set());

    const boards = useMemo(() => (schedulingData ? schedulingData.boards : []), [schedulingData]);
    const cards = useMemo(() => (schedulingData ? schedulingData.cards : []), [schedulingData]);
    const members = useMemo(() => (schedulingData ? schedulingData.members : []), [schedulingData]);

    useEffect(() => {
      onChartViewsFetch(projectId);
    }, [projectId, onChartViewsFetch]);

    useEffect(() => {
      boards.forEach((board) => {
        if (!board.isLoaded && !requestedBoardsRef.current.has(board.id)) {
          requestedBoardsRef.current.add(board.id);
          onBoardFetch(board.id);
        }
      });
    }, [boards, onBoardFetch]);

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
      (cardId, explicitDate, rowId) => {
        const base = explicitDate || markerDate || startOfDay(new Date());
        onCardUpdate(cardId, { startDate: base, dueDate: addDays(base, SCHEDULE_SPAN_DAYS) });

        if (rowId && rowId.startsWith(MEMBER_PREFIX)) {
          onUserAddToCard(rowId.slice(MEMBER_PREFIX.length), cardId);
        }
      },
      [markerDate, onCardUpdate, onUserAddToCard],
    );

    const getRowLabel = useCallback(
      (rowId) => {
        if (rowId === UNASSIGNED_ROW_ID) {
          return t('common.unassigned');
        }
        const member = members.find((m) => `${MEMBER_PREFIX}${m.id}` === rowId);
        return member ? member.name : t('common.unassigned');
      },
      [members, t],
    );

    const handleReassign = useCallback(
      (cardId, fromRowId, toRowId, additive) => {
        if (fromRowId === toRowId) {
          return;
        }

        const card = cards.find((c) => c.id === cardId);

        setPendingReassign({
          cardId,
          fromRowId,
          toRowId,
          additive,
          cardName: card ? card.name : '',
          fromLabel: getRowLabel(fromRowId),
          toLabel: getRowLabel(toRowId),
        });
      },
      [cards, getRowLabel],
    );

    const handleConfirmReassign = useCallback(() => {
      if (!pendingReassign) {
        return;
      }

      const { cardId, fromRowId, toRowId, additive } = pendingReassign;
      const fromUserId = fromRowId.startsWith(MEMBER_PREFIX) ? fromRowId.slice(MEMBER_PREFIX.length) : null;
      const toUserId = toRowId.startsWith(MEMBER_PREFIX) ? toRowId.slice(MEMBER_PREFIX.length) : null;

      if (toUserId && toUserId !== fromUserId) {
        onUserAddToCard(toUserId, cardId);
      }
      if (!additive && fromUserId && fromUserId !== toUserId) {
        onUserRemoveFromCard(fromUserId, cardId);
      }

      setPendingReassign(null);
    }, [pendingReassign, onUserAddToCard, onUserRemoveFromCard]);

    const handleCancelReassign = useCallback(() => {
      setPendingReassign(null);
    }, []);

    const toggleRowCollapse = useCallback((rowId) => {
      setCollapsedRows((prev) => {
        const next = new Set(prev);
        if (next.has(rowId)) {
          next.delete(rowId);
        } else {
          next.add(rowId);
        }
        return next;
      });
    }, []);

    const isScheduled = (card) => card.startDate || card.dueDate;

    const { rows, unscheduledBars } = useMemo(() => {
      const scheduledCards = cards.filter(isScheduled);
      const tray = cards
        .filter((card) => !isScheduled(card))
        .map((card) => ({ id: `tray:${card.id}`, cardId: card.id, name: card.name, color: card.color, canEdit: card.canEdit, boardId: card.boardId, boardName: card.boardName, listName: card.listName }));

      const makeBar = (rowId, card) => ({ id: `${rowId}:card:${card.id}`, cardId: card.id, name: card.name, startDate: card.startDate, dueDate: card.dueDate, color: card.color, canEdit: card.canEdit });

      const resultRows = [];

      const unassignedCards = scheduledCards.filter((card) => card.memberUserIds.length === 0);
      resultRows.push({
        id: UNASSIGNED_ROW_ID,
        label: t('common.unassigned'),
        bars: unassignedCards.map((card) => makeBar(UNASSIGNED_ROW_ID, card)),
        collapsible: true,
        lanesCollapsed: collapsedRows.has(UNASSIGNED_ROW_ID),
        onToggleLanes: () => toggleRowCollapse(UNASSIGNED_ROW_ID),
      });

      members.forEach((member) => {
        const rowId = `${MEMBER_PREFIX}${member.id}`;
        const memberCards = scheduledCards.filter((card) => card.memberUserIds.includes(member.id));
        resultRows.push({
          id: rowId,
          labelNode: (
            <span className={s.memberLabel}>
              <User name={member.name} avatarUrl={member.avatarUrl} size="small" />
              <span className={s.memberName}>{member.name}</span>
            </span>
          ),
          dropLabel: member.name,
          bars: memberCards.map((card) => makeBar(rowId, card)),
          collapsible: true,
          lanesCollapsed: collapsedRows.has(rowId),
          onToggleLanes: () => toggleRowCollapse(rowId),
        });
      });

      return { rows: resultRows, unscheduledBars: tray };
    }, [cards, members, t, collapsedRows, toggleRowCollapse]);

    const handleApplyView = useCallback((view) => {
      setActiveViewId(view.id);
      if (view.config && view.config.zoom) {
        setZoom(view.config.zoom);
      }
    }, []);

    const handleSaveView = useCallback(() => {
      onChartViewCreate(projectId, {
        type: 'teamPlanner',
        name: t('common.teamPlannerView', { number: chartViews.length + 1 }),
        position: (chartViews.length + 1) * 65535,
        config: { zoom },
      });
    }, [onChartViewCreate, projectId, t, chartViews.length, zoom]);

    const handleUpdateActiveView = useCallback(() => {
      if (activeViewId) {
        onChartViewUpdate(activeViewId, { config: { zoom } });
      }
    }, [activeViewId, onChartViewUpdate, zoom]);

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

    const viewOptions = chartViews.map((v) => ({ id: v.id, name: v.name }));

    return (
      <div className={s.wrapper}>
        <ProjectNavContainer />
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>{t('common.teamPlanner')}</h1>
          <p className={s.pageDescription}>{t('common.teamPlannerDescription')}</p>
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
          <div className={s.hint}>{t('common.teamPlannerHint')}</div>
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
            unscheduledBars={unscheduledBars}
            emptyText={t('common.noProjectMembers')}
            selectedCardId={selectedCard ? selectedCard.id : undefined}
            onBarClick={handleBarClick}
            onBarReschedule={handleReschedule}
            onBarReassign={handleReassign}
            onScheduleFromTray={handleScheduleFromTray}
            onMarkerSet={setMarkerDate}
          />
          {selectedCard && <CardDetailPanelContainer cardId={selectedCard.id} canEdit={selectedCard.canEdit} color={selectedCard.color} onClose={handlePanelClose} />}
          {pendingReassign && (
            <ReassignConfirmDialog
              cardName={pendingReassign.cardName}
              fromLabel={pendingReassign.fromLabel}
              toLabel={pendingReassign.toLabel}
              additive={pendingReassign.additive}
              onConfirm={handleConfirmReassign}
              onCancel={handleCancelReassign}
            />
          )}
        </div>
      </div>
    );
  },
);

TeamPlanner.propTypes = {
  projectId: PropTypes.string.isRequired,
  schedulingData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  chartViews: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canManageViews: PropTypes.bool.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onCardUpdate: PropTypes.func.isRequired,
  onUserAddToCard: PropTypes.func.isRequired,
  onUserRemoveFromCard: PropTypes.func.isRequired,
  onChartViewsFetch: PropTypes.func.isRequired,
  onChartViewCreate: PropTypes.func.isRequired,
  onChartViewUpdate: PropTypes.func.isRequired,
  onChartViewDelete: PropTypes.func.isRequired,
};

TeamPlanner.defaultProps = {
  schedulingData: null,
};

export default TeamPlanner;
