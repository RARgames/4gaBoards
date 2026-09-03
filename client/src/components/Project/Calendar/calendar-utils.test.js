import { MODE, buildWeekSegments, getCardSpan, getVisibleRange, getWeeks } from './calendar-utils';

const day = (value) => new Date(`${value}T00:00:00`);

const event = (id, name, start, end) => ({ id, name, span: { start: day(start), end: day(end) } });

// 2026-09-02 is a Wednesday, so its Monday-based week runs 2026-08-31 → 2026-09-06.
const WEEK = getWeeks(getVisibleRange(day('2026-09-02'), MODE.WEEK))[0];

describe('getCardSpan', () => {
  test('spans start date through due date', () => {
    expect(getCardSpan({ startDate: '2026-09-01T09:00:00.000Z', dueDate: '2026-09-04T17:00:00.000Z' })).toEqual({ start: day('2026-09-01'), end: day('2026-09-04') });
  });

  test('falls back to a single day when only one date is set', () => {
    expect(getCardSpan({ startDate: null, dueDate: '2026-09-04T17:00:00.000Z' })).toEqual({ start: day('2026-09-04'), end: day('2026-09-04') });
    expect(getCardSpan({ startDate: '2026-09-01T09:00:00.000Z', dueDate: null })).toEqual({ start: day('2026-09-01'), end: day('2026-09-01') });
  });

  test('orders reversed dates so the span is never negative', () => {
    expect(getCardSpan({ startDate: '2026-09-04T09:00:00.000Z', dueDate: '2026-09-01T17:00:00.000Z' })).toEqual({ start: day('2026-09-01'), end: day('2026-09-04') });
  });

  test('returns null for an unscheduled card', () => {
    expect(getCardSpan({ startDate: null, dueDate: null })).toBeNull();
  });
});

describe('getVisibleRange', () => {
  test('covers whole weeks around the month', () => {
    const { start, end } = getVisibleRange(day('2026-09-15'), MODE.MONTH);

    expect(start).toEqual(day('2026-08-31'));
    expect(end).toEqual(day('2026-10-04'));
    expect(getWeeks({ start, end })).toHaveLength(5);
  });

  test('covers the single Monday-based week in week mode', () => {
    expect(WEEK[0]).toEqual(day('2026-08-31'));
    expect(WEEK[6]).toEqual(day('2026-09-06'));
  });
});

describe('buildWeekSegments', () => {
  test('clips a span to the week and reports its column and width', () => {
    const { segments } = buildWeekSegments([event('1', 'Spans the boundary', '2026-08-28', '2026-09-02')], WEEK, 3);

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ colStart: 0, span: 3, lane: 0 });
  });

  test('keeps non-overlapping events in the same lane', () => {
    const { segments } = buildWeekSegments([event('1', 'Early', '2026-08-31', '2026-09-01'), event('2', 'Late', '2026-09-03', '2026-09-04')], WEEK, 3);

    expect(segments.map((segment) => segment.lane)).toEqual([0, 0]);
  });

  test('stacks overlapping events into separate lanes, longest first', () => {
    const { segments } = buildWeekSegments([event('1', 'Short', '2026-08-31', '2026-08-31'), event('2', 'Long', '2026-08-31', '2026-09-04')], WEEK, 3);

    expect(segments.find((segment) => segment.event.id === '2').lane).toBe(0);
    expect(segments.find((segment) => segment.event.id === '1').lane).toBe(1);
  });

  test('counts events past the lane cap per day instead of rendering them', () => {
    const events = ['1', '2', '3', '4'].map((id) => event(id, `Card ${id}`, '2026-09-01', '2026-09-02'));
    const { segments, overflowByDay } = buildWeekSegments(events, WEEK, 3);

    expect(segments).toHaveLength(3);
    expect(overflowByDay).toEqual([0, 1, 1, 0, 0, 0, 0]);
  });

  test('ignores events outside the week', () => {
    expect(buildWeekSegments([event('1', 'Next month', '2026-10-01', '2026-10-02')], WEEK, 3).segments).toEqual([]);
  });
});
