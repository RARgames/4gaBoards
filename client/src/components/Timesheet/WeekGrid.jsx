import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { addDays, addMinutes, differenceInCalendarDays, format, isSameDay, startOfDay } from 'date-fns';
import PropTypes from 'prop-types';

import formatDuration from '../../utils/format-duration';
import { Icon, IconType, IconSize } from '../Utils';

import * as s from './WeekGrid.module.scss';

export const HOUR_HEIGHT = 48;
const MINUTES_PER_SLOT = 15;
const MIN_DURATION_MINUTES = 15;
const DEFAULT_CREATE_MINUTES = 30;
const DEFAULT_SCROLL_HOUR = 6;
const MOVE_THRESHOLD = 4;
const DAY_MINUTES = 24 * 60;
const LONG_ENTRY_DURATION_MS = 6 * 60 * 60 * 1000;
const VERY_LONG_ENTRY_DURATION_MS = 8 * 60 * 60 * 1000;

const snapMinutes = (minutes) => Math.min(DAY_MINUTES, Math.max(0, Math.round(minutes / MINUTES_PER_SLOT) * MINUTES_PER_SLOT));

const yToMinutes = (y) => (y / HOUR_HEIGHT) * 60;

const minutesToY = (minutes) => (minutes / 60) * HOUR_HEIGHT;

const WeekGrid = React.memo(({ weekStart, entries, onCreate, onMove, onResize, onEntryClick }) => {
  const [t] = useTranslation();
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const scrollRef = useRef(null);
  const columnRefs = useRef([]);
  const suppressNextClickRef = useRef(false);
  const hasScrolledRef = useRef(false);

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  const entriesByDay = useMemo(() => {
    const map = new Map(days.map((day) => [differenceInCalendarDays(day, weekStart), []]));
    entries.forEach((entry) => {
      const dayIndex = differenceInCalendarDays(startOfDay(entry.startedAt), weekStart);
      if (map.has(dayIndex)) {
        map.get(dayIndex).push(entry);
      }
    });
    return map;
  }, [entries, days, weekStart]);

  useEffect(() => {
    if (!hasScrolledRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = DEFAULT_SCROLL_HOUR * HOUR_HEIGHT;
      hasScrolledRef.current = true;
    }
  }, []);

  const dayIndexFromClientX = useCallback((clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const columnEl = el && el.closest('[data-day-index]');
    return columnEl ? Number(columnEl.getAttribute('data-day-index')) : null;
  }, []);

  const minutesFromClientY = useCallback((clientY, dayIndex) => {
    const columnEl = columnRefs.current[dayIndex];
    if (!columnEl) {
      return 0;
    }
    const rect = columnEl.getBoundingClientRect();
    return snapMinutes(yToMinutes(clientY - rect.top));
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const state = dragRef.current;
      if (!state) {
        return;
      }

      const moved = state.moved || Math.abs(e.clientY - state.startClientY) > MOVE_THRESHOLD || Math.abs(e.clientX - state.startClientX) > MOVE_THRESHOLD;

      if (state.mode === 'create') {
        const currentMinutes = minutesFromClientY(e.clientY, state.dayIndex);
        const next = { ...state, currentMinutes, moved };
        dragRef.current = next;
        setDrag(next);
        return;
      }

      if (state.mode === 'move') {
        const deltaMinutes = snapMinutes(yToMinutes(e.clientY - state.startClientY) + state.originalStartMinutes) - state.originalStartMinutes;
        const overDayIndex = dayIndexFromClientX(e.clientX, e.clientY);
        const next = { ...state, deltaMinutes, overDayIndex: overDayIndex === null ? state.dayIndex : overDayIndex, moved };
        dragRef.current = next;
        setDrag(next);
        return;
      }

      // resize-start / resize-end
      const minutes = minutesFromClientY(e.clientY, state.dayIndex);
      const next = { ...state, currentMinutes: minutes, moved };
      dragRef.current = next;
      setDrag(next);
    },
    [minutesFromClientY, dayIndexFromClientX],
  );

  const handlePointerUp = useCallback(() => {
    const state = dragRef.current;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    dragRef.current = null;
    setDrag(null);

    if (!state) {
      return;
    }

    if (state.moved) {
      suppressNextClickRef.current = true;
    }

    if (state.mode === 'create') {
      let startMinutes = Math.min(state.anchorMinutes, state.currentMinutes);
      let endMinutes = Math.max(state.anchorMinutes, state.currentMinutes);
      if (endMinutes - startMinutes < MIN_DURATION_MINUTES) {
        startMinutes = state.anchorMinutes;
        endMinutes = Math.min(DAY_MINUTES, startMinutes + DEFAULT_CREATE_MINUTES);
      }

      const dayDate = startOfDay(days[state.dayIndex]);
      onCreate({
        startedAt: addMinutes(dayDate, startMinutes),
        endedAt: addMinutes(dayDate, endMinutes),
        anchorRect: {
          top: (columnRefs.current[state.dayIndex]?.getBoundingClientRect().top || 0) + minutesToY(startMinutes),
          left: columnRefs.current[state.dayIndex]?.getBoundingClientRect().left || 0,
          width: columnRefs.current[state.dayIndex]?.getBoundingClientRect().width || 0,
          height: minutesToY(endMinutes - startMinutes),
        },
      });
      return;
    }

    if (state.mode === 'move') {
      const newStartMinutes = snapMinutes(state.originalStartMinutes + (state.deltaMinutes || 0));
      const clampedStart = Math.min(newStartMinutes, DAY_MINUTES - state.durationMinutes);
      const targetDayIndex = state.overDayIndex === null || state.overDayIndex === undefined ? state.dayIndex : state.overDayIndex;
      const dayDate = startOfDay(days[targetDayIndex]);
      const newStartedAt = addMinutes(dayDate, Math.max(0, clampedStart));
      const newEndedAt = addMinutes(newStartedAt, state.durationMinutes);

      if (state.moved) {
        onMove(state.entry, newStartedAt, newEndedAt);
      } else {
        onEntryClick(state.entry, state.entryRect);
      }
      return;
    }

    if (state.mode === 'resize-start' || state.mode === 'resize-end') {
      const dayDate = startOfDay(days[state.dayIndex]);

      if (!state.moved) {
        onEntryClick(state.entry, state.entryRect);
        return;
      }

      if (state.mode === 'resize-start') {
        const newStart = Math.min(state.currentMinutes, state.originalEndMinutes - MIN_DURATION_MINUTES);
        onResize(state.entry, addMinutes(dayDate, Math.max(0, newStart)), state.entry.endedAt);
      } else {
        const newEnd = Math.max(state.currentMinutes, state.originalStartMinutes + MIN_DURATION_MINUTES);
        onResize(state.entry, state.entry.startedAt, addMinutes(dayDate, Math.min(DAY_MINUTES, newEnd)));
      }
    }
  }, [handlePointerMove, days, onCreate, onMove, onResize, onEntryClick]);

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  const startDrag = useCallback(
    (state) => {
      dragRef.current = state;
      setDrag(state);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  const handleColumnPointerDown = useCallback(
    (e, dayIndex) => {
      if (e.target.closest('[data-entry-block]')) {
        return;
      }
      e.preventDefault();
      const minutes = minutesFromClientY(e.clientY, dayIndex);
      startDrag({ mode: 'create', dayIndex, anchorMinutes: minutes, currentMinutes: minutes, startClientY: e.clientY, startClientX: e.clientX, moved: false });
    },
    [minutesFromClientY, startDrag],
  );

  const handleEntryPointerDown = useCallback(
    (e, entry, dayIndex) => {
      e.preventDefault();
      e.stopPropagation();
      const originalStartMinutes = entry.startedAt.getHours() * 60 + entry.startedAt.getMinutes();
      const durationMinutes = Math.round((entry.endedAt.getTime() - entry.startedAt.getTime()) / 60000);
      const entryRect = e.currentTarget.getBoundingClientRect();
      startDrag({
        mode: 'move',
        dayIndex,
        entry,
        entryRect,
        originalStartMinutes,
        durationMinutes,
        deltaMinutes: 0,
        overDayIndex: dayIndex,
        startClientY: e.clientY,
        startClientX: e.clientX,
        moved: false,
      });
    },
    [startDrag],
  );

  const handleResizeHandlePointerDown = useCallback(
    (e, entry, dayIndex, mode) => {
      e.preventDefault();
      e.stopPropagation();
      const startMinutes = entry.startedAt.getHours() * 60 + entry.startedAt.getMinutes();
      const endMinutes = entry.endedAt.getHours() * 60 + entry.endedAt.getMinutes();
      const entryRect = e.currentTarget.closest('[data-entry-block]')?.getBoundingClientRect();
      startDrag({
        mode,
        dayIndex,
        entry,
        entryRect,
        originalStartMinutes: startMinutes,
        originalEndMinutes: endMinutes || DAY_MINUTES,
        currentMinutes: mode === 'resize-start' ? startMinutes : endMinutes,
        startClientY: e.clientY,
        startClientX: e.clientX,
        moved: false,
      });
    },
    [startDrag],
  );

  const handleEntryClick = useCallback(
    (e, entry) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      onEntryClick(entry, e.currentTarget.getBoundingClientRect());
    },
    [onEntryClick],
  );

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const renderEntryBlock = (entry, dayIndex) => {
    const startMinutes = entry.startedAt.getHours() * 60 + entry.startedAt.getMinutes();
    const rawEndMinutes = isSameDay(entry.startedAt, entry.endedAt) ? entry.endedAt.getHours() * 60 + entry.endedAt.getMinutes() : DAY_MINUTES;
    const endMinutes = Math.max(startMinutes + MIN_DURATION_MINUTES, rawEndMinutes);
    const durationMs = entry.endedAt.getTime() - entry.startedAt.getTime();
    const isDraggingThis = drag && drag.entry && drag.entry.id === entry.id;
    const previewStartMinutes =
      isDraggingThis && drag.mode === 'move' ? Math.max(0, Math.min(snapMinutes(drag.originalStartMinutes + (drag.deltaMinutes || 0)), DAY_MINUTES - drag.durationMinutes)) : startMinutes;

    let previewEndMinutes = endMinutes;
    if (isDraggingThis && drag.mode === 'resize-end') {
      previewEndMinutes = Math.max(drag.currentMinutes, startMinutes + MIN_DURATION_MINUTES);
    } else if (isDraggingThis && drag.mode === 'move') {
      previewEndMinutes = previewStartMinutes + drag.durationMinutes;
    }

    const previewStart = isDraggingThis && drag.mode === 'resize-start' ? Math.min(drag.currentMinutes, endMinutes - MIN_DURATION_MINUTES) : previewStartMinutes;

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        key={entry.id}
        data-entry-block
        className={clsx(
          s.entryBlock,
          durationMs > VERY_LONG_ENTRY_DURATION_MS ? s.entryBlockVeryLong : durationMs > LONG_ENTRY_DURATION_MS && s.entryBlockLong,
          isDraggingThis && s.entryBlockDragging,
          entry.isPersisted === false && s.entryBlockUnsaved,
        )}
        style={{ top: minutesToY(previewStart), height: Math.max(14, minutesToY(previewEndMinutes - previewStart)), borderLeftColor: entry.projectColor || undefined }}
        onPointerDown={(e) => handleEntryPointerDown(e, entry, dayIndex)}
        onClick={(e) => handleEntryClick(e, entry)}
        title={entry.title || entry.cardName || entry.description || t('common.noDescription')}
      >
        <div className={s.entryResizeHandle} data-role="resize-start" onPointerDown={(e) => handleResizeHandlePointerDown(e, entry, dayIndex, 'resize-start')} />
        <div className={s.entryContent}>
          <span className={s.entryDescription}>{entry.title || entry.cardName || entry.description || t('common.noDescription')}</span>
          <span className={s.entryTime}>
            {format(entry.startedAt, 'HH:mm')}–{format(entry.endedAt, 'HH:mm')}
          </span>
          {(entry.cardName || entry.projectName) && <span className={s.entryProject}>{entry.cardName || entry.projectName}</span>}
        </div>
        <div className={s.entryResizeHandle} data-role="resize-end" onPointerDown={(e) => handleResizeHandlePointerDown(e, entry, dayIndex, 'resize-end')} />
      </div>
    );
  };

  return (
    <div className={s.wrapper}>
      <div className={s.headerRow}>
        <div className={s.gutterHeader} />
        {days.map((day) => {
          const dayIndex = differenceInCalendarDays(day, weekStart);
          const dayEntries = entriesByDay.get(dayIndex) || [];
          const totalMinutes = dayEntries.reduce((sum, entry) => sum + Math.round((entry.endedAt.getTime() - entry.startedAt.getTime()) / 60000), 0);

          return (
            <div key={day.toISOString()} className={clsx(s.dayHeaderCell, isSameDay(day, now) && s.dayHeaderCellToday)}>
              <span className={s.dayHeaderName}>{format(day, 'EEE')}</span>
              <span className={s.dayHeaderDate}>{format(day, 'd')}</span>
              {totalMinutes > 0 && <span className={s.dayHeaderTotal}>{formatDuration(totalMinutes)}</span>}
            </div>
          );
        })}
      </div>
      <div className={s.scrollArea} ref={scrollRef}>
        <div className={s.gridInner} style={{ height: HOUR_HEIGHT * 24 }}>
          <div className={s.gutter}>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className={s.hourLabel} style={{ top: hour * HOUR_HEIGHT }}>
                {hour > 0 && `${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
          <div className={s.days}>
            {days.map((day) => {
              const dayIndex = differenceInCalendarDays(day, weekStart);
              const dayEntries = entriesByDay.get(dayIndex) || [];
              const isToday = isSameDay(day, now);
              const isCreatingHere = drag && drag.mode === 'create' && drag.dayIndex === dayIndex;

              return (
                <div
                  key={day.toISOString()}
                  ref={(el) => (columnRefs.current[dayIndex] = el)} // eslint-disable-line no-return-assign
                  data-day-index={dayIndex}
                  className={clsx(s.dayColumn, isToday && s.dayColumnToday)}
                  onPointerDown={(e) => handleColumnPointerDown(e, dayIndex)}
                >
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className={s.hourLine} style={{ top: hour * HOUR_HEIGHT }} />
                  ))}
                  {isToday && (
                    <div className={s.nowLine} style={{ top: minutesToY(nowMinutes) }}>
                      <span className={s.nowDot} />
                    </div>
                  )}
                  {isCreatingHere && (
                    <div
                      className={s.createGhost}
                      style={{
                        top: minutesToY(Math.min(drag.anchorMinutes, drag.currentMinutes)),
                        height: Math.max(14, minutesToY(Math.abs(drag.currentMinutes - drag.anchorMinutes))),
                      }}
                    >
                      <Icon type={IconType.Plus} size={IconSize.Size12} />
                    </div>
                  )}
                  {dayEntries.map((entry) => renderEntryBlock(entry, dayIndex))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

WeekGrid.propTypes = {
  weekStart: PropTypes.instanceOf(Date).isRequired,
  entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  onEntryClick: PropTypes.func.isRequired,
};

export default WeekGrid;
