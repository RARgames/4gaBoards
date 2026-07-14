import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { addDays, format } from 'date-fns';
import PropTypes from 'prop-types';

import { getBoardAccentColor } from '../../../utils/board-colors';
import { Icon, IconType, IconSize, Input, InputStyle } from '../../Utils';
import {
  GROUP_ROW_HEIGHT,
  HEADER_HEIGHT,
  LABEL_WIDTH,
  ROW_HEIGHT,
  SCHEDULE_SPAN_DAYS,
  assignLanes,
  buildDays,
  buildHeaderSegments,
  computeRange,
  dayIndexOf,
  getDayWidth,
  resolveBarGeometry,
} from './timeline-utils';

import * as s from './Timeline.module.scss';

const TRAY_LIMIT = 150;
const MOVE_THRESHOLD = 3;

const Timeline = React.memo(({ rows, zoom, viewDate, markerDate, unscheduledBars, emptyText, selectedCardId, onBarClick, onBarReschedule, onBarReassign, onScheduleFromTray, onMarkerSet }) => {
  const [t] = useTranslation();
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const gridRef = useRef(null);
  const suppressNextClickRef = useRef(false);
  const [backlogCollapsed, setBacklogCollapsed] = useState(false);
  const [backlogQuery, setBacklogQuery] = useState('');
  // Backlog board groups default to collapsed (opt-in expand) so every board is listed without
  // scrolling past a large board's unscheduled cards, matching the Gantt board-row default.
  const [expandedBacklogGroups, setExpandedBacklogGroups] = useState(() => new Set());
  const [scheduleDrag, setScheduleDrag] = useState(null);
  const scheduleDragRef = useRef(null);

  const dayWidth = getDayWidth(zoom);

  const allDates = useMemo(() => {
    const dates = [];
    rows.forEach((row) => {
      (row.bars || []).forEach((bar) => {
        if (bar.startDate) {
          dates.push(bar.startDate);
        }
        if (bar.dueDate) {
          dates.push(bar.dueDate);
        }
      });
    });
    return dates;
  }, [rows]);

  const { rangeStart, dayCount } = useMemo(() => computeRange(allDates, viewDate, zoom), [allDates, viewDate, zoom]);
  const days = useMemo(() => buildDays(rangeStart, dayCount), [rangeStart, dayCount]);
  const segments = useMemo(() => buildHeaderSegments(days, zoom), [days, zoom]);

  const timeWidth = dayCount * dayWidth;
  const todayIndex = dayIndexOf(new Date(), rangeStart);
  const markerIndex = markerDate ? dayIndexOf(markerDate, rangeStart) : null;

  // Scroll the navigated-to date into view whenever viewDate/zoom changes (rangeStart may have
  // been pulled earlier than viewDate to keep existing bars visible, so the viewport wouldn't
  // otherwise show the period the user just navigated to).
  useEffect(() => {
    const scrollEl = gridRef.current;
    if (!scrollEl || !viewDate) {
      return;
    }

    const viewIndex = dayIndexOf(viewDate, rangeStart);
    const targetLeft = Math.max(0, viewIndex * dayWidth - (scrollEl.clientWidth - LABEL_WIDTH) / 2);
    scrollEl.scrollLeft = targetLeft;
  }, [viewDate, zoom, rangeStart, dayWidth]);

  // Per-row lane assignment for overlapping bars. Rows with more bars than fit in one lane get
  // extra vertical space (unless collapsed, which forces everything into a single translucent
  // lane so overlap is still visible without growing the row).
  const laneInfoByRowId = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      if (row.isGroup) {
        return;
      }
      const natural = assignLanes(row.bars);
      const overlapCount = (row.bars || []).filter((bar) => (natural.laneOf.get(bar.id) || 0) > 0).length;
      if (row.lanesCollapsed && natural.laneCount > 1) {
        map.set(row.id, { laneOf: new Map((row.bars || []).map((bar) => [bar.id, 0])), laneCount: 1, naturalLaneCount: natural.laneCount, overlapCount, isOverlapCollapsed: true });
      } else {
        map.set(row.id, { ...natural, naturalLaneCount: natural.laneCount, overlapCount, isOverlapCollapsed: false });
      }
    });
    return map;
  }, [rows]);

  // Groups the unscheduled tray by board first (over the full list, so every board with a
  // matching card gets a header — groups default to collapsed, so listing them all is cheap),
  // then applies the render cap per group so a single huge board can't starve out the rest.
  const backlogGroups = useMemo(() => {
    const query = backlogQuery.trim().toLowerCase();
    const filtered = query ? unscheduledBars.filter((bar) => bar.name.toLowerCase().includes(query)) : unscheduledBars;

    const order = [];
    const byBoard = new Map();
    filtered.forEach((bar) => {
      const boardId = bar.boardId || 'unknown';
      if (!byBoard.has(boardId)) {
        byBoard.set(boardId, { boardId, boardName: bar.boardName || bar.name, bars: [] });
        order.push(boardId);
      }
      byBoard.get(boardId).bars.push(bar);
    });

    return order.map((boardId) => {
      const group = byBoard.get(boardId);
      return { ...group, visibleBars: group.bars.slice(0, TRAY_LIMIT), remaining: Math.max(0, group.bars.length - TRAY_LIMIT) };
    });
  }, [unscheduledBars, backlogQuery]);

  const toggleBacklogGroup = useCallback((boardId) => {
    setExpandedBacklogGroups((prev) => {
      const next = new Set(prev);
      if (next.has(boardId)) {
        next.delete(boardId);
      } else {
        next.add(boardId);
      }
      return next;
    });
  }, []);

  const layout = useMemo(() => {
    let offset = 0;
    const laidOut = rows.map((row) => {
      const laneInfo = laneInfoByRowId.get(row.id);
      const height = row.isGroup ? GROUP_ROW_HEIGHT : (laneInfo ? laneInfo.laneCount : 1) * ROW_HEIGHT;
      const entry = { row, top: offset, height };
      offset += height;
      return entry;
    });
    return { laidOut, bodyHeight: offset };
  }, [rows, laneInfoByRowId]);

  const handlePointerMove = useCallback(
    (e) => {
      const state = dragRef.current;
      if (!state) {
        return;
      }

      const dayDelta = Math.round((e.clientX - state.startX) / dayWidth);
      const moved = state.moved || Math.abs(e.clientX - state.startX) > MOVE_THRESHOLD || Math.abs(e.clientY - state.startY) > MOVE_THRESHOLD;
      let overRowId = state.rowId;

      if (state.mode === 'move' && onBarReassign) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const rowEl = el && el.closest('[data-timeline-row-id]');
        if (rowEl) {
          overRowId = rowEl.getAttribute('data-timeline-row-id');
        }
      }

      const next = { ...state, dayDelta, overRowId, moved };
      dragRef.current = next;
      setDrag(next);
    },
    [dayWidth, onBarReassign],
  );

  const handlePointerUp = useCallback(
    (e) => {
      const state = dragRef.current;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dragRef.current = null;
      setDrag(null);

      if (!state) {
        return;
      }

      // The browser still synthesizes a native click on the release target after a real drag.
      // Swallow that one click (via capture-phase handler on the wrapper) so it never reopens
      // the card or re-fires a schedule action.
      if (state.moved) {
        suppressNextClickRef.current = true;
      }

      const { bar, mode, dayDelta, rowId, overRowId } = state;
      const geometry = resolveBarGeometry(bar);

      if (dayDelta !== 0 && geometry) {
        const payload = {};
        if (geometry.isMilestone) {
          payload.dueDate = addDays(geometry.endDay, dayDelta);
        } else if (mode === 'move') {
          if (bar.startDate) {
            payload.startDate = addDays(geometry.startDay, dayDelta);
          }
          if (bar.dueDate) {
            payload.dueDate = addDays(geometry.endDay, dayDelta);
          }
        } else if (mode === 'resize-start') {
          const newStart = addDays(geometry.startDay, dayDelta);
          payload.startDate = newStart > geometry.endDay ? geometry.endDay : newStart;
        } else if (mode === 'resize-end') {
          const newEnd = addDays(geometry.endDay, dayDelta);
          payload.dueDate = newEnd < geometry.startDay ? geometry.startDay : newEnd;
        }

        if (Object.keys(payload).length > 0) {
          onBarReschedule(bar.cardId, payload);
        }
      }

      if (mode === 'move' && onBarReassign && overRowId && overRowId !== rowId) {
        onBarReassign(bar.cardId, rowId, overRowId, e.ctrlKey || e.metaKey);
      }
    },
    [handlePointerMove, onBarReschedule, onBarReassign],
  );

  const handleBarPointerDown = useCallback(
    (e, bar, row, mode) => {
      if (!bar.canEdit) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const state = { bar, rowId: row.id, mode, startX: e.clientX, startY: e.clientY, dayDelta: 0, overRowId: row.id, moved: false };
      dragRef.current = state;
      setDrag(state);

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  // Runs before any onClick on a bar/tray item; drops the one synthetic click that follows a
  // real drag release so releasing LMB over a card never re-opens or re-triggers it.
  const handleWrapperClickCapture = useCallback((e) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  // Shared geometry: which day column sits under a client-space X coordinate, or null if
  // the point falls outside the grid (over the row labels or off the scrollable area).
  const dayIndexFromClientX = useCallback(
    (clientX) => {
      const scrollEl = gridRef.current;
      if (!scrollEl) {
        return null;
      }
      const rect = scrollEl.getBoundingClientRect();
      const xInGrid = clientX - rect.left + scrollEl.scrollLeft - LABEL_WIDTH;
      if (xInGrid < 0) {
        return null;
      }
      return Math.floor(xInGrid / dayWidth);
    },
    [dayWidth],
  );

  const handleSchedulePointerMove = useCallback(
    (e) => {
      if (!scheduleDragRef.current) {
        return;
      }
      const dayIndex = dayIndexFromClientX(e.clientX);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const rowEl = el && el.closest('[data-timeline-row-id]');
      const overRowId = rowEl ? rowEl.getAttribute('data-timeline-row-id') : null;
      const next = { ...scheduleDragRef.current, dayIndex, overRowId };
      scheduleDragRef.current = next;
      setScheduleDrag(next);
    },
    [dayIndexFromClientX],
  );

  const handleSchedulePointerUp = useCallback(
    (e) => {
      const state = scheduleDragRef.current;
      window.removeEventListener('pointermove', handleSchedulePointerMove);
      window.removeEventListener('pointerup', handleSchedulePointerUp);
      scheduleDragRef.current = null;
      setScheduleDrag(null);

      if (!state) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      suppressNextClickRef.current = true;

      if (state.dayIndex !== null && onScheduleFromTray) {
        onScheduleFromTray(state.cardId, addDays(rangeStart, state.dayIndex), state.overRowId);
      }
    },
    [handleSchedulePointerMove, onScheduleFromTray, rangeStart],
  );

  const handleBacklogPointerDown = useCallback(
    (e, bar) => {
      if (!bar.canEdit || !onScheduleFromTray) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const state = { cardId: bar.cardId, name: bar.name, color: bar.color, dayIndex: dayIndexFromClientX(e.clientX), overRowId: null };
      scheduleDragRef.current = state;
      setScheduleDrag(state);

      window.addEventListener('pointermove', handleSchedulePointerMove);
      window.addEventListener('pointerup', handleSchedulePointerUp);
    },
    [dayIndexFromClientX, onScheduleFromTray, handleSchedulePointerMove, handleSchedulePointerUp],
  );

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handleSchedulePointerMove);
      window.removeEventListener('pointerup', handleSchedulePointerUp);
    },
    [handleSchedulePointerMove, handleSchedulePointerUp],
  );

  const handleGridClick = useCallback(
    (e) => {
      if (!onMarkerSet) {
        return;
      }
      if (e.target.closest('[data-timeline-bar]')) {
        return;
      }

      const dayIndex = dayIndexFromClientX(e.clientX);
      if (dayIndex === null) {
        return;
      }

      onMarkerSet(markerIndex === dayIndex ? null : addDays(rangeStart, dayIndex));
    },
    [onMarkerSet, dayIndexFromClientX, rangeStart, markerIndex],
  );

  const renderBar = (bar, row) => {
    const geometry = resolveBarGeometry(bar);
    if (!geometry) {
      return null;
    }

    const isDragging = drag && drag.bar.id === bar.id;
    const dayDelta = isDragging ? drag.dayDelta : 0;

    let startIndex = dayIndexOf(geometry.startDay, rangeStart);
    let endIndex = dayIndexOf(geometry.endDay, rangeStart);

    if (isDragging) {
      if (drag.mode === 'move') {
        startIndex += dayDelta;
        endIndex += dayDelta;
      } else if (drag.mode === 'resize-start') {
        startIndex = Math.min(startIndex + dayDelta, endIndex);
      } else if (drag.mode === 'resize-end') {
        endIndex = Math.max(endIndex + dayDelta, startIndex);
      }
    }

    const left = startIndex * dayWidth;
    const width = (endIndex - startIndex + 1) * dayWidth;

    const laneInfo = laneInfoByRowId.get(row.id);
    const laneTop = (laneInfo ? laneInfo.laneOf.get(bar.id) || 0 : 0) * ROW_HEIGHT;
    const isOverlapCollapsed = !!(laneInfo && laneInfo.isOverlapCollapsed);
    const isSelected = !!selectedCardId && bar.cardId === selectedCardId;

    if (geometry.isMilestone) {
      return (
        <button
          key={bar.id}
          type="button"
          data-timeline-bar
          className={clsx(s.milestone, isDragging && s.barDragging, isOverlapCollapsed && s.barOverlap, isSelected && s.barSelected)}
          style={{ left: left + dayWidth / 2, top: laneTop + 10, borderBottomColor: bar.color || undefined }}
          title={bar.name}
          aria-label={bar.name}
          onPointerDown={(e) => handleBarPointerDown(e, bar, row, 'move')}
          onClick={() => onBarClick(bar.cardId, bar.canEdit, bar.color)}
        />
      );
    }

    return (
      <div
        key={bar.id}
        data-timeline-bar
        className={clsx(s.bar, isDragging && s.barDragging, isOverlapCollapsed && s.barOverlap, isSelected && s.barSelected)}
        style={{ left, width, top: laneTop + 6, backgroundColor: bar.color || undefined }}
      >
        {bar.canEdit && <span className={clsx(s.resizeHandle, s.resizeHandleStart)} onPointerDown={(e) => handleBarPointerDown(e, bar, row, 'resize-start')} />}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <span
          className={s.barBody}
          title={`${bar.name}\n${format(addDays(rangeStart, startIndex), 'MMM d')} – ${format(addDays(rangeStart, endIndex), 'MMM d')}`}
          onPointerDown={(e) => handleBarPointerDown(e, bar, row, 'move')}
          onClick={() => onBarClick(bar.cardId, bar.canEdit, bar.color)}
        >
          {bar.name}
        </span>
        {bar.canEdit && <span className={clsx(s.resizeHandle, s.resizeHandleEnd)} onPointerDown={(e) => handleBarPointerDown(e, bar, row, 'resize-end')} />}
      </div>
    );
  };

  // Where the dragged bar would land if dropped in the row currently under the pointer,
  // so reassigning between rows previews the result instead of just highlighting the target.
  const reassignPreview = useMemo(() => {
    if (!drag || drag.mode !== 'move' || drag.overRowId === drag.rowId) {
      return null;
    }
    const geometry = resolveBarGeometry(drag.bar);
    if (!geometry) {
      return null;
    }
    const startIndex = dayIndexOf(geometry.startDay, rangeStart) + drag.dayDelta;
    const endIndex = dayIndexOf(geometry.endDay, rangeStart) + drag.dayDelta;
    return { rowId: drag.overRowId, left: startIndex * dayWidth, width: (endIndex - startIndex + 1) * dayWidth, color: drag.bar.color };
  }, [drag, rangeStart, dayWidth]);

  // Same idea for a card being dragged out of the backlog: once it's over a row that can
  // actually take an assignment (a Team Planner member/unassigned row), preview it landing
  // there instead of just floating a date label at the top of the timeline.
  const scheduleRowPreview = useMemo(() => {
    if (!scheduleDrag || !scheduleDrag.overRowId || scheduleDrag.dayIndex === null) {
      return null;
    }
    const targetRow = rows.find((row) => row.id === scheduleDrag.overRowId);
    if (!targetRow || !targetRow.collapsible) {
      return null;
    }
    return {
      rowId: targetRow.id,
      left: scheduleDrag.dayIndex * dayWidth,
      width: (SCHEDULE_SPAN_DAYS + 1) * dayWidth,
      color: scheduleDrag.color,
      name: scheduleDrag.name,
      dropLabel: targetRow.dropLabel || targetRow.label || '',
    };
  }, [scheduleDrag, rows, dayWidth]);

  return (
    <div className={s.wrapper} onClickCapture={handleWrapperClickCapture}>
      {unscheduledBars.length > 0 && (
        <div className={clsx(s.drawer, backlogCollapsed && s.drawerCollapsed)}>
          {backlogCollapsed ? (
            <button type="button" className={s.drawerCollapsedStrip} title={t('common.expand')} onClick={() => setBacklogCollapsed(false)}>
              <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.caretIcon, s.caretIconCollapsed)} />
              <span className={s.drawerCollapsedLabel}>{t('common.backlog')}</span>
              <span className={s.trayBadge}>{unscheduledBars.length}</span>
            </button>
          ) : (
            <>
              <div className={s.drawerHeader}>
                <span className={s.drawerTitle}>{t('common.backlog')}</span>
                <span className={s.trayBadge}>{unscheduledBars.length}</span>
                <div className={s.drawerSpacer} />
                <button type="button" className={s.collapseButton} title={t('common.collapse')} onClick={() => setBacklogCollapsed(true)}>
                  <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={s.caretIcon} />
                </button>
              </div>
              <div className={s.drawerSearch}>
                <Input style={InputStyle.FullWidth} value={backlogQuery} onChange={(e) => setBacklogQuery(e.target.value)} placeholder={t('common.searchBacklog')} />
              </div>
              <div className={s.drawerList}>
                {backlogGroups.map((group) => {
                  const groupCollapsed = !expandedBacklogGroups.has(group.boardId);
                  return (
                    <div key={group.boardId}>
                      <button type="button" className={s.drawerGroupHead} style={{ borderLeftColor: getBoardAccentColor(group.boardId) }} onClick={() => toggleBacklogGroup(group.boardId)}>
                        <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.caretIcon, groupCollapsed && s.caretIconCollapsed)} />
                        <span className={s.drawerGroupName}>{group.boardName}</span>
                        <span className={s.trayBadge}>{group.bars.length}</span>
                      </button>
                      {!groupCollapsed && (
                        <>
                          {group.visibleBars.map((bar) => (
                            <div key={bar.id} className={s.drawerRow}>
                              {bar.canEdit && onScheduleFromTray && (
                                <span className={s.drawerGrip} title={t('common.dragToSchedule')} onPointerDown={(e) => handleBacklogPointerDown(e, bar)}>
                                  <Icon type={IconType.GripVertical} size={IconSize.Size10} />
                                </span>
                              )}
                              <span className={s.drawerDot} style={{ background: bar.color || undefined }} />
                              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                              <span className={s.drawerRowName} title={bar.name} onClick={() => onBarClick(bar.cardId, bar.canEdit, bar.color)}>
                                {bar.name}
                              </span>
                              {bar.listName && <span className={s.drawerRowList}>{bar.listName}</span>}
                              {bar.canEdit && onScheduleFromTray && (
                                <button type="button" className={s.trayScheduleButton} title={t('action.schedule')} onClick={() => onScheduleFromTray(bar.cardId)}>
                                  <Icon type={IconType.Plus} size={IconSize.Size10} />
                                </button>
                              )}
                            </div>
                          ))}
                          {group.remaining > 0 && <div className={s.trayMore}>{t('common.andMore', { count: group.remaining })}</div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <div className={s.main}>
        <div ref={gridRef} className={s.scroll}>
          <div className={s.grid} style={{ width: LABEL_WIDTH + timeWidth }}>
            <div className={s.header} style={{ height: HEADER_HEIGHT }}>
              <div className={s.headerCorner} style={{ width: LABEL_WIDTH }}>
                {t('common.timeline_title')}
              </div>
              <div className={s.headerTime} style={{ width: timeWidth }}>
                <div className={s.headerTopTier}>
                  {segments.map((seg) => (
                    <div key={seg.key} className={s.headerSegment} style={{ width: seg.span * dayWidth }}>
                      <span className={s.headerSegmentLabel}>{seg.label}</span>
                    </div>
                  ))}
                </div>
                <div className={s.headerBottomTier}>
                  {days.map((day) => (
                    <div key={day.index} className={clsx(s.headerDay, day.isWeekend && s.headerDayWeekend)} style={{ width: dayWidth }}>
                      {zoom !== 'month' && <span className={s.headerDayNum}>{format(day.date, zoom === 'day' ? 'EEEEE d' : 'd')}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div className={s.body} style={{ height: layout.bodyHeight }} onClick={handleGridClick}>
              <div className={s.overlay} style={{ left: LABEL_WIDTH, width: timeWidth, height: layout.bodyHeight }}>
                {days.map((day) => day.isWeekend && <div key={day.index} className={s.weekend} style={{ left: day.index * dayWidth, width: dayWidth }} />)}
                {todayIndex >= 0 && todayIndex < dayCount && <div className={s.todayLine} style={{ left: todayIndex * dayWidth + dayWidth / 2 }} />}
                {markerIndex !== null && markerIndex >= 0 && markerIndex < dayCount && <div className={s.markerLine} style={{ left: markerIndex * dayWidth }} title={t('common.scheduleMarkerHint')} />}
                {scheduleDrag && scheduleDrag.dayIndex !== null && scheduleDrag.dayIndex >= 0 && scheduleDrag.dayIndex < dayCount && (
                  <div className={s.scheduleGhostLine} style={{ left: scheduleDrag.dayIndex * dayWidth }} />
                )}
              </div>

              {/* Separate layer for labels that must stay readable above bars (unlike the guide
                    lines in .overlay, which is deliberately behind bars and would otherwise trap
                    these via its own stacking context). */}
              <div className={s.overlayTop} style={{ left: LABEL_WIDTH, width: timeWidth, height: layout.bodyHeight }}>
                {todayIndex >= 0 && todayIndex < dayCount && (
                  <div className={s.todayPill} style={{ left: todayIndex * dayWidth + dayWidth / 2 }}>
                    {t('action.today')}
                  </div>
                )}
                {/* Once the drag is over a row that can take the card, the in-row preview below
                      takes over; this floating version is the fallback while hovering the header,
                      an empty area, or a page (like Gantt) with no assignable rows to target. */}
                {!scheduleRowPreview && scheduleDrag && scheduleDrag.dayIndex !== null && scheduleDrag.dayIndex >= 0 && scheduleDrag.dayIndex < dayCount && (
                  <>
                    <div className={s.scheduleGhostBar} style={{ left: scheduleDrag.dayIndex * dayWidth, width: (SCHEDULE_SPAN_DAYS + 1) * dayWidth, backgroundColor: scheduleDrag.color || undefined }}>
                      {scheduleDrag.name}
                    </div>
                    <div className={s.scheduleGhostDate} style={{ left: scheduleDrag.dayIndex * dayWidth, width: (SCHEDULE_SPAN_DAYS + 1) * dayWidth }}>
                      {format(addDays(rangeStart, scheduleDrag.dayIndex), 'MMM d')} – {format(addDays(rangeStart, scheduleDrag.dayIndex + SCHEDULE_SPAN_DAYS), 'MMM d')}
                    </div>
                  </>
                )}
              </div>

              {layout.laidOut.map(({ row, top, height }) => {
                const laneInfo = laneInfoByRowId.get(row.id);
                const isReassignTarget = drag && drag.mode === 'move' && drag.overRowId === row.id && drag.rowId !== row.id;
                const isScheduleTarget = scheduleRowPreview && scheduleRowPreview.rowId === row.id;
                const showPreview = reassignPreview && reassignPreview.rowId === row.id;

                return (
                  <div key={row.id} data-timeline-row-id={row.id} className={clsx(s.row, row.isGroup && s.rowGroup, (isReassignTarget || isScheduleTarget) && s.rowReassignTarget)} style={{ top, height }}>
                    <div className={clsx(s.rowLabel, row.isGroup && s.rowLabelGroup)} style={{ width: LABEL_WIDTH, paddingLeft: 12 + (row.indent || 0) * 16 }}>
                      {row.isGroup && row.onToggleCollapse && (
                        <button type="button" className={s.collapseButton} onClick={row.onToggleCollapse}>
                          <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.caretIcon, row.isCollapsed && s.caretIconCollapsed)} />
                        </button>
                      )}
                      {!row.isGroup && row.collapsible && row.onToggleLanes && (laneInfo?.naturalLaneCount || 1) > 1 && (
                        <button type="button" className={s.collapseButton} title={row.lanesCollapsed ? t('common.expand') : t('common.collapse')} onClick={row.onToggleLanes}>
                          <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.caretIcon, row.lanesCollapsed && s.caretIconCollapsed)} />
                        </button>
                      )}
                      <div className={s.rowLabelMain}>
                        {row.labelNode || <span className={s.rowLabelText}>{row.label}</span>}
                        {row.collapsible && (
                          <span className={s.rowWorkload}>
                            {t('common.cardCount', { count: (row.bars || []).length })}
                            {laneInfo && laneInfo.overlapCount > 0 && <> · {t('common.overlapCount', { count: laneInfo.overlapCount })}</>}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={s.rowTrack} style={{ width: timeWidth }}>
                      {(isReassignTarget || isScheduleTarget) && <div className={s.dropHint}>{t('common.dropToAssign', { name: row.dropLabel || row.label || '' })}</div>}
                      {showPreview && <div className={s.reassignPreview} style={{ left: reassignPreview.left, width: reassignPreview.width, backgroundColor: reassignPreview.color || undefined }} />}
                      {isScheduleTarget && (
                        <div className={s.reassignPreview} style={{ left: scheduleRowPreview.left, width: scheduleRowPreview.width, backgroundColor: scheduleRowPreview.color || undefined }}>
                          {scheduleRowPreview.name}
                        </div>
                      )}
                      {!row.isGroup && (row.bars || []).map((bar) => renderBar(bar, row))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {rows.length === 0 && <div className={s.empty}>{emptyText}</div>}
      </div>
    </div>
  );
});

Timeline.propTypes = {
  rows: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  zoom: PropTypes.string.isRequired,
  viewDate: PropTypes.instanceOf(Date),
  markerDate: PropTypes.instanceOf(Date),
  unscheduledBars: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  emptyText: PropTypes.string,
  selectedCardId: PropTypes.string,
  onBarClick: PropTypes.func.isRequired,
  onBarReschedule: PropTypes.func.isRequired,
  onBarReassign: PropTypes.func,
  onScheduleFromTray: PropTypes.func,
  onMarkerSet: PropTypes.func,
};

Timeline.defaultProps = {
  viewDate: undefined,
  markerDate: undefined,
  unscheduledBars: [],
  emptyText: undefined,
  selectedCardId: undefined,
  onBarReassign: undefined,
  onScheduleFromTray: undefined,
  onMarkerSet: undefined,
};

export default Timeline;
