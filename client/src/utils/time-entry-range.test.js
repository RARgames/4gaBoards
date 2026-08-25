import parseTimeEntryRange from './time-entry-range';

describe('parseTimeEntryRange', () => {
  test('keeps a same-day time range on the start date', () => {
    const date = new Date(2026, 7, 24, 8, 0);

    const range = parseTimeEntryRange(date, date, '09:15', '17:30');

    expect(range.startedAt).toEqual(new Date(2026, 7, 24, 9, 15));
    expect(range.endedAt).toEqual(new Date(2026, 7, 24, 17, 30));
  });

  test('moves an earlier end time to the following day', () => {
    const date = new Date(2026, 7, 24, 8, 0);

    const range = parseTimeEntryRange(date, date, '23:00', '01:00');

    expect(range.startedAt).toEqual(new Date(2026, 7, 24, 23, 0));
    expect(range.endedAt).toEqual(new Date(2026, 7, 25, 1, 0));
  });

  test('accepts midnight as the end of the start day', () => {
    const date = new Date(2026, 7, 24, 8, 0);

    const range = parseTimeEntryRange(date, date, '23:45', '00:00');

    expect(range.endedAt).toEqual(new Date(2026, 7, 25, 0, 0));
  });

  test('treats equal clock times as a full-day entry', () => {
    const date = new Date(2026, 7, 24, 8, 0);

    const range = parseTimeEntryRange(date, date, '09:00', '09:00');

    expect(range.endedAt.getTime() - range.startedAt.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  test('preserves the end date of an existing multi-day entry', () => {
    const startedAt = new Date(2026, 7, 24, 8, 0);
    const endedAt = new Date(2026, 7, 26, 10, 0);

    const range = parseTimeEntryRange(startedAt, endedAt, '08:30', '10:30');

    expect(range.startedAt).toEqual(new Date(2026, 7, 24, 8, 30));
    expect(range.endedAt).toEqual(new Date(2026, 7, 26, 10, 30));
  });

  test('rejects invalid clock values', () => {
    const date = new Date(2026, 7, 24, 8, 0);

    expect(parseTimeEntryRange(date, date, '25:00', '26:00')).toBeNull();
  });
});
