import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { selectCurrentUserId } from './users';

export const makeSelectTaskById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Task }, id) => {
      const taskModel = Task.withId(id);

      if (!taskModel) {
        return taskModel;
      }

      return {
        ...taskModel.ref,
        ...getMeta(taskModel),
      };
    },
  );

export const selectTaskById = makeSelectTaskById();

export const makeSelectUsersForTaskById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Task }, id, currentUserId) => {
      const taskModel = Task.withId(id);

      if (!taskModel) {
        return taskModel;
      }

      return taskModel.users.toRefArray().sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return a.name.localeCompare(b.name);
      });
    },
  );

export const selectUsersForTaskById = makeSelectUsersForTaskById();

export default {
  makeSelectTaskById,
  selectTaskById,
  makeSelectUsersForTaskById,
  selectUsersForTaskById,
};
