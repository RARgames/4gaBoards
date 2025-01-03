import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectTaskById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Task }, id) => {
      const taskModel = Task.withId(id);

      if (!taskModel) {
        return taskModel;
      }

      return taskModel.ref;
    },
  );

export const selectTaskById = makeSelectTaskById();

export const selectUsersForTaskById = createSelector(
  orm,
  (_, id) => id,
  ({ Task }, id) => {
    const taskModel = Task.withId(id);

    if (!taskModel) {
      return taskModel;
    }

    return taskModel.users.toRefArray();
  },
);

export default {
  makeSelectTaskById,
  selectTaskById,
  selectUsersForTaskById,
};
