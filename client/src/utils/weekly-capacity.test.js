import getWeeklyCapacity from './weekly-capacity';

describe('getWeeklyCapacity', () => {
  test('returns the remaining minutes for the week', () => {
    expect(getWeeklyCapacity(40, 32 * 60 + 30)).toEqual({
      capacityMinutes: 2400,
      remainingMinutes: 450,
      isOverCapacity: false,
    });
  });

  test('supports fractional weekly hours', () => {
    expect(getWeeklyCapacity(37.5, 30 * 60)).toEqual({
      capacityMinutes: 2250,
      remainingMinutes: 450,
      isOverCapacity: false,
    });
  });

  test('clamps remaining time at zero when capacity is exceeded', () => {
    expect(getWeeklyCapacity(40, 41 * 60)).toEqual({
      capacityMinutes: 2400,
      remainingMinutes: 0,
      isOverCapacity: true,
    });
  });
});
