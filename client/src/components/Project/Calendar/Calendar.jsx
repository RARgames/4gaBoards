import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { addDays, format, isSameDay, isSameMonth, isWeekend, startOfDay } from 'date-fns';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import api from '../../../api';
import CardDetailPanelContainer from '../../../containers/Project/CardDetailPanelContainer';
import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';
import { CHIP_GAP, CHIP_HEIGHT, MAX_LANES, MODE, buildWeekSegments, getCardSpan, getVisibleRange, getWeeks, shiftViewDate, toDay } from './calendar-utils';

import * as bs from '../../../backgrounds.module.scss';
import * as s from './Calendar.module.scss';

const laneOffset = (lane) => lane * (CHIP_HEIGHT + CHIP_GAP);

const Calendar = React.memo(({ projectId, accessToken, schedulingData, onBoardFetch }) => {
  const [t] = useTranslation();

  const [mode, setMode] = useState(MODE.MONTH);
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [selectedCard, setSelectedCard] = useState(null);
  const [linkedEvents, setLinkedEvents] = useState([]);
  const [linkedCalendars, setLinkedCalendars] = useState([]);

  const requestedBoardsRef = useRef(new Set());
  const today = useMemo(() => startOfDay(new Date()), []);

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

  const range = useMemo(() => getVisibleRange(viewDate, mode), [viewDate, mode]);

  const cardEvents = useMemo(() => {
    if (!schedulingData) {
      return [];
    }

    return schedulingData.cards
      .map((card) => {
        const span = getCardSpan(card);
        return span ? { ...card, span } : null;
      })
      .filter(Boolean);
  }, [schedulingData]);

  // Events come from the linked calendars rather than the ORM, scoped to the visible range. The
  // request is keyed to that range, so paging months refetches; a stale in-flight response is
  // discarded rather than overwriting a newer one.
  useEffect(() => {
    if (!projectId) {
      return undefined;
    }

    let isStale = false;

    (async () => {
      try {
        // The grid's last day is inclusive; the API takes an exclusive upper bound.
        // The response carries every enabled calendar alongside the events, so the legend can
        // list a calendar even in a period where it happens to have nothing scheduled.
        const { items, calendars } = await api.getCalendarEvents(projectId, { from: range.start.toISOString(), to: addDays(range.end, 1).toISOString() }, { Authorization: `Bearer ${accessToken}` });

        if (!isStale) {
          setLinkedEvents(items);
          setLinkedCalendars(calendars || []);
        }
      } catch {
        if (!isStale) {
          setLinkedEvents([]);
          setLinkedCalendars([]);
        }
      }
    })();

    return () => {
      isStale = true;
    };
  }, [projectId, accessToken, range]);

  // Calendar events join the same lane packing as cards so a busy day reads as one block rather
  // than two competing stacks, but they carry their calendar's colour and are not clickable.
  const events = useMemo(
    () => [
      ...cardEvents,
      ...linkedEvents.map((event) => ({
        id: event.id,
        name: event.title,
        calendarColor: event.color,
        calendarName: event.calendarName,
        isLinkedEvent: true,
        span: { start: toDay(event.startDate), end: toDay(event.endDate) },
      })),
    ],
    [cardEvents, linkedEvents],
  );

  const weeks = useMemo(() => getWeeks(range), [range]);
  const maxLanes = MAX_LANES[mode];
  const weekLayouts = useMemo(() => weeks.map((days) => buildWeekSegments(events, days, maxLanes)), [weeks, events, maxLanes]);

  const handleChipClick = useCallback((event) => {
    if (event.isLinkedEvent) {
      return;
    }

    setSelectedCard({ id: event.id, canEdit: event.canEdit, color: event.color });
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedCard(null);
  }, []);

  // The hidden cards are the ones that did not fit the month cell's lanes, so drop into the week
  // view on that day, where every lane is visible, rather than opening a separate day popup.
  const handleOverflowClick = useCallback((day) => {
    setViewDate(day);
    setMode(MODE.WEEK);
  }, []);

  const renderModeButton = (value, label) => (
    <Button style={ButtonStyle.NoBackground} className={clsx(s.modeButton, mode === value && s.modeButtonActive)} onClick={() => setMode(value)}>
      {label}
    </Button>
  );

  const renderWeek = (days, layout) => (
    <div key={days[0].getTime()} className={s.week}>
      <div className={s.dayCells}>
        {days.map((day) => (
          <div key={day.getTime()} className={clsx(s.dayCell, isWeekend(day) && s.dayCellWeekend, mode === MODE.MONTH && !isSameMonth(day, viewDate) && s.dayCellOutside)}>
            <span className={clsx(s.dayNumber, isSameDay(day, today) && s.dayNumberToday)}>{format(day, 'd')}</span>
          </div>
        ))}
      </div>
      <div className={s.segments}>
        {layout.segments.map(({ key, event, colStart, span, lane }) => (
          <button
            key={key}
            type="button"
            className={clsx(
              s.chip,
              event.isLinkedEvent && s.chipEvent,
              event.isLinkedEvent && bs[`background${upperFirst(camelCase(event.calendarColor))}`],
              selectedCard && selectedCard.id === event.id && s.chipSelected,
            )}
            style={{
              left: `calc(${(colStart / 7) * 100}% + 3px)`,
              width: `calc(${(span / 7) * 100}% - 6px)`,
              top: `${laneOffset(lane)}px`,
              // Cards get a generated per-card colour; linked events take their calendar's
              // palette class instead, so the two never read as the same thing.
              ...(event.isLinkedEvent ? {} : { backgroundColor: event.color }),
            }}
            title={event.isLinkedEvent ? `${event.name} · ${event.calendarName}` : `${event.name} · ${event.boardName} · ${event.listName}`}
            onClick={() => handleChipClick(event)}
          >
            {event.name}
          </button>
        ))}
        {layout.overflowByDay.map((count, index) =>
          count > 0 ? (
            <button
              key={days[index].getTime()}
              type="button"
              className={s.overflow}
              style={{ left: `calc(${(index / 7) * 100}% + 3px)`, width: `calc(${(1 / 7) * 100}% - 6px)`, top: `${laneOffset(maxLanes)}px` }}
              onClick={() => handleOverflowClick(days[index])}
            >
              {t('common.andMore', { count })}
            </button>
          ) : null,
        )}
      </div>
    </div>
  );

  if (!schedulingData) {
    return (
      <div className={s.wrapper}>
        <ProjectNavContainer />
        <div className={s.empty}>{t('common.projectNotFound', { context: 'title' })}</div>
      </div>
    );
  }

  const periodLabel = mode === MODE.WEEK ? `${format(weeks[0][0], 'MMM d')} – ${format(weeks[0][6], 'MMM d, yyyy')}` : format(viewDate, 'MMMM yyyy');

  return (
    <div className={s.wrapper}>
      <ProjectNavContainer />
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>{t('common.calendar')}</h1>
        <p className={s.pageDescription}>{t('common.calendarDescription')}</p>
      </div>
      <div className={s.toolbar}>
        <div className={s.modeGroup}>
          {renderModeButton(MODE.MONTH, t('common.month'))}
          {renderModeButton(MODE.WEEK, t('common.week'))}
        </div>
        <div className={s.navGroup}>
          <Button style={ButtonStyle.Icon} title={t('action.previousPeriod')} onClick={() => setViewDate((d) => shiftViewDate(d, mode, -1))}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} />
          </Button>
          <Button style={ButtonStyle.NoBackground} className={s.todayButton} onClick={() => setViewDate(startOfDay(new Date()))}>
            {t('action.today')}
          </Button>
          <Button style={ButtonStyle.Icon} title={t('action.nextPeriod')} onClick={() => setViewDate((d) => shiftViewDate(d, mode, 1))}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={s.iconFlipped} />
          </Button>
          <span className={s.periodLabel}>{periodLabel}</span>
        </div>
        <div className={s.spacer} />
      </div>
      {linkedCalendars.length > 0 && (
        <div className={s.legend}>
          <span className={s.legendTitle}>{t('common.linkedCalendars')}</span>
          {linkedCalendars.map((calendar) => (
            <span key={calendar.id} className={s.legendItem}>
              <span className={clsx(s.legendSwatch, bs[`background${upperFirst(camelCase(calendar.color))}`])} />
              {calendar.name}
            </span>
          ))}
        </div>
      )}
      <div className={s.content}>
        <div className={s.calendar}>
          <div className={s.weekdays}>
            {weeks[0].map((day) => (
              <span key={day.getTime()} className={s.weekday}>
                {format(day, 'EEE')}
              </span>
            ))}
          </div>
          <div className={clsx(s.weeks, mode === MODE.WEEK && s.weeksSingle)}>{weeks.map((days, index) => renderWeek(days, weekLayouts[index]))}</div>
          {events.length === 0 && <div className={s.emptyOverlay}>{t('common.noScheduledCards')}</div>}
        </div>
        {selectedCard && <CardDetailPanelContainer cardId={selectedCard.id} canEdit={selectedCard.canEdit} color={selectedCard.color} onClose={handlePanelClose} />}
      </div>
    </div>
  );
});

Calendar.propTypes = {
  projectId: PropTypes.string,
  accessToken: PropTypes.string.isRequired,
  schedulingData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onBoardFetch: PropTypes.func.isRequired,
};

Calendar.defaultProps = {
  projectId: undefined,
  schedulingData: null,
};

export default Calendar;
