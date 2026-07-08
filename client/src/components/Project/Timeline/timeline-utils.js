import { addDays, addMonths, addYears, differenceInCalendarDays, format, isSameMonth, isWeekend, startOfDay, startOfWeek } from 'date-fns';

export const ZOOM = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

export const LABEL_WIDTH = 264;
export const ROW_HEIGHT = 36;
export const GROUP_ROW_HEIGHT = 30;
export const HEADER_HEIGHT = 48;

// How many days addDays(startDate, N) covers when scheduling a card at the marker/drop point
// with no explicit due date yet (e.g. addDays(base, N) below spans N+1 calendar days inclusive).
export const SCHEDULE_SPAN_DAYS = 2;

const MAX_DAY_COUNT = 800;

// How much context to show around the navigated viewDate, in days, per zoom level.
const WINDOW_BY_ZOOM = {
  [ZOOM.DAY]: { lead: 10, trail: 50 },
  [ZOOM.WEEK]: { lead: 30, trail: 150 },
  [ZOOM.MONTH]: { lead: 90, trail: 450 },
};

// How far Prev/Next paging moves viewDate, per zoom level.
const PERIOD_BY_ZOOM = {
  [ZOOM.DAY]: { unit: 'months', amount: 1 },
  [ZOOM.WEEK]: { unit: 'months', amount: 3 },
  [ZOOM.MONTH]: { unit: 'years', amount: 1 },
};

export const getDayWidth = (zoom) => {
  switch (zoom) {
    case ZOOM.MONTH:
      return 9;
    case ZOOM.WEEK:
      return 22;
    default:
      return 40;
  }
};

export const toDay = (value) => startOfDay(new Date(value));

export const shiftViewDate = (viewDate, zoom, direction) => {
  const period = PERIOD_BY_ZOOM[zoom] || PERIOD_BY_ZOOM[ZOOM.DAY];

  return period.unit === 'years' ? addYears(viewDate, direction * period.amount) : addMonths(viewDate, direction * period.amount);
};

// Computes a [rangeStart, dayCount] window anchored at viewDate (sized per zoom so day/week/month
// zoom each show a sensible amount of context, and Prev/Next/Today can reach any month of any
// year), unioned with any scheduled dates so existing bars are never clipped out of view.
export const computeRange = (dates, viewDate, zoom) => {
  const anchor = toDay(viewDate || new Date());
  const window = WINDOW_BY_ZOOM[zoom] || WINDOW_BY_ZOOM[ZOOM.DAY];

  let rangeStart = addDays(anchor, -window.lead);
  let rangeEnd = addDays(anchor, window.trail);

  const valid = (dates || []).filter(Boolean).map(toDay);
  valid.forEach((d) => {
    if (d < rangeStart) {
      rangeStart = addDays(d, -3);
    }
    if (d > rangeEnd) {
      rangeEnd = addDays(d, 3);
    }
  });

  let dayCount = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
  if (dayCount > MAX_DAY_COUNT) {
    dayCount = MAX_DAY_COUNT;
    rangeEnd = addDays(rangeStart, MAX_DAY_COUNT - 1);
  }

  return { rangeStart, rangeEnd, dayCount };
};

export const buildDays = (rangeStart, dayCount) => {
  const days = [];
  for (let i = 0; i < dayCount; i += 1) {
    const date = addDays(rangeStart, i);
    days.push({ index: i, date, isWeekend: isWeekend(date) });
  }
  return days;
};

// Groups days into top-tier header segments (months for month/week zoom, weeks for day zoom).
export const buildHeaderSegments = (days, zoom) => {
  if (days.length === 0) {
    return [];
  }

  const segments = [];
  const useWeeks = zoom === ZOOM.DAY;

  let current = null;
  days.forEach((day) => {
    const key = useWeeks ? format(startOfWeek(day.date, { weekStartsOn: 1 }), 'yyyy-ww') : format(day.date, 'yyyy-MM');

    if (!current || current.key !== key) {
      if (current) {
        segments.push(current);
      }
      current = {
        key,
        label: useWeeks ? format(startOfWeek(day.date, { weekStartsOn: 1 }), "'W'w · MMM d") : format(day.date, 'MMMM yyyy'),
        span: 1,
      };
    } else {
      current.span += 1;
    }
  });
  if (current) {
    segments.push(current);
  }

  return segments;
};

export const dayIndexOf = (date, rangeStart) => differenceInCalendarDays(toDay(date), rangeStart);

// Resolves a bar's geometry (in day units) from its start/due dates.
// Returns null when the bar has no dates. isMilestone => render a diamond at a single day.
export const resolveBarGeometry = (bar) => {
  const { startDate, dueDate } = bar;

  if (!startDate && !dueDate) {
    return null;
  }

  if (startDate && dueDate) {
    return { startDay: toDay(startDate), endDay: toDay(dueDate), isMilestone: false };
  }

  if (startDate) {
    return { startDay: toDay(startDate), endDay: toDay(startDate), isMilestone: false };
  }

  return { startDay: toDay(dueDate), endDay: toDay(dueDate), isMilestone: true };
};

export const isSameMonthLabel = isSameMonth;

// Greedy interval partitioning: each bar goes in the first lane whose last occupant ends
// before this bar starts, otherwise a new lane opens. Lets rows with overlapping bars (e.g.
// a Team Planner member with two cards scheduled on the same days) stack instead of clipping.
export const assignLanes = (bars) => {
  const items = (bars || [])
    .map((bar) => {
      const geometry = resolveBarGeometry(bar);
      return geometry && { id: bar.id, startDay: geometry.startDay, endDay: geometry.endDay };
    })
    .filter(Boolean)
    .sort((a, b) => a.startDay - b.startDay || a.endDay - b.endDay);

  const laneEnds = [];
  const laneOf = new Map();

  items.forEach((item) => {
    let lane = laneEnds.findIndex((end) => end < item.startDay);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.endDay);
    } else {
      laneEnds[lane] = item.endDay;
    }
    laneOf.set(item.id, lane);
  });

  return { laneOf, laneCount: Math.max(laneEnds.length, 1) };
};
