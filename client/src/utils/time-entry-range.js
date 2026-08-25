import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';

const parseTimeToDate = (baseDate, value) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return setMinutes(setHours(startOfDay(baseDate), hours), minutes);
};

const parseTimeEntryRange = (initialStartedAt, initialEndedAt, startTime, endTime) => {
  const startedAt = parseTimeToDate(initialStartedAt, startTime);
  let endedAt = parseTimeToDate(initialEndedAt, endTime);

  if (!startedAt || !endedAt) {
    return null;
  }

  // A clock time at or before the start means the entry crossed midnight. Anchoring the end
  // clock to its original date first also preserves entries that already span multiple days.
  if (endedAt <= startedAt) {
    endedAt = addDays(endedAt, 1);
  }

  return { startedAt, endedAt };
};

export default parseTimeEntryRange;
