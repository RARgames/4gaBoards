import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectTimeEntryById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ TimeEntry }, id) => {
      const timeEntryModel = TimeEntry.withId(id);

      if (!timeEntryModel) {
        return timeEntryModel;
      }

      return timeEntryModel.ref;
    },
  );

export const selectTimeEntryById = makeSelectTimeEntryById();

// Unfiltered — the Timesheet page owns its own week window and viewed-user state locally
// (not in Redux), so it filters this down itself rather than needing a selector per range.
export const selectTimeEntries = createSelector(orm, ({ TimeEntry }) => TimeEntry.all().toRefArray());

export const makeSelectTimeEntriesForUserInRange = () =>
  createSelector(
    orm,
    (_, userId) => userId,
    (_, __, from) => from,
    (_, __, ___, to) => to,
    ({ TimeEntry }, userId, from, to) =>
      TimeEntry.filter((timeEntry) => timeEntry.userId === userId && timeEntry.startedAt < to && timeEntry.endedAt > from)
        .toRefArray()
        .sort((a, b) => a.startedAt - b.startedAt),
  );

export const selectTimeEntriesForUserInRange = makeSelectTimeEntriesForUserInRange();

export default {
  makeSelectTimeEntryById,
  selectTimeEntryById,
  selectTimeEntries,
  makeSelectTimeEntriesForUserInRange,
  selectTimeEntriesForUserInRange,
};
