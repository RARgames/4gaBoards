import { addDays, addMonths, differenceInCalendarDays, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

export const MODE = {
  MONTH: 'month',
  WEEK: 'week',
};

// Monday, matching every other date grid in the app (timesheet, timeline).
export const WEEK_STARTS_ON = 1;

export const CHIP_HEIGHT = 18;
export const CHIP_GAP = 2;
export const DAY_NUMBER_HEIGHT = 22;

// How many event lanes a day cell shows before the rest collapses into a "+N more" chip.
export const MAX_LANES = {
  [MODE.MONTH]: 3,
  [MODE.WEEK]: 12,
};

export const toDay = (value) => startOfDay(new Date(value));

export const shiftViewDate = (viewDate, mode, direction) => (mode === MODE.WEEK ? addDays(viewDate, direction * 7) : addMonths(viewDate, direction));

// The visible day span, given as start-of-day on both ends so the bounds compare cleanly against
// the day-normalized card spans: whole weeks covering the month, or the single week around viewDate.
export const getVisibleRange = (viewDate, mode) => {
  const anchorStart = mode === MODE.WEEK ? viewDate : startOfMonth(viewDate);
  const anchorEnd = mode === MODE.WEEK ? viewDate : endOfMonth(viewDate);

  return {
    start: startOfWeek(anchorStart, { weekStartsOn: WEEK_STARTS_ON }),
    end: startOfDay(endOfWeek(anchorEnd, { weekStartsOn: WEEK_STARTS_ON })),
  };
};

export const getWeeks = ({ start, end }) => {
  const weeks = [];

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)));
  }

  return weeks;
};

// The inclusive day span a card occupies. A card carrying only one of the two dates occupies that
// single day, so half-scheduled cards still surface instead of silently dropping off the calendar.
export const getCardSpan = (card) => {
  const start = card.startDate ? toDay(card.startDate) : null;
  const due = card.dueDate ? toDay(card.dueDate) : null;

  if (!start && !due) {
    return null;
  }

  if (!start) {
    return { start: due, end: due };
  }

  if (!due) {
    return { start, end: start };
  }

  return due < start ? { start: due, end: start } : { start, end: due };
};

// Packs the events overlapping one week row into lanes: each event is clipped to the row, then
// placed in the topmost lane whose previous segment has already ended. Sorting by start and then
// by longest span keeps multi-day cards on the upper lanes, which reads better than letting them
// weave between short ones. Anything past maxLanes is counted per day for the "+N more" chip.
export const buildWeekSegments = (events, weekDays, maxLanes) => {
  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];

  const clipped = events
    .map((event) => {
      if (event.span.end < weekStart || event.span.start > weekEnd) {
        return null;
      }

      const start = event.span.start < weekStart ? weekStart : event.span.start;
      const end = event.span.end > weekEnd ? weekEnd : event.span.end;

      return { event, colStart: differenceInCalendarDays(start, weekStart), span: differenceInCalendarDays(end, start) + 1 };
    })
    .filter(Boolean)
    .sort((a, b) => a.colStart - b.colStart || b.span - a.span || a.event.name.localeCompare(b.event.name));

  const laneEnds = [];
  const segments = [];
  const overflowByDay = weekDays.map(() => 0);

  clipped.forEach((item) => {
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= item.colStart);

    if (lane === -1) {
      lane = laneEnds.length;
    }

    laneEnds[lane] = item.colStart + item.span;

    if (lane < maxLanes) {
      segments.push({ key: `${item.event.id}:${item.colStart}`, ...item, lane });
    } else {
      for (let day = item.colStart; day < item.colStart + item.span; day += 1) {
        overflowByDay[day] += 1;
      }
    }
  });

  return { segments, overflowByDay };
};

export default { MODE, MAX_LANES, CHIP_HEIGHT, CHIP_GAP, DAY_NUMBER_HEIGHT, WEEK_STARTS_ON, toDay, shiftViewDate, getVisibleRange, getWeeks, getCardSpan, buildWeekSegments };
