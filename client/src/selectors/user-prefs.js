import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectCurrentUserId } from './users';

export const selectCurrentUserPrefs = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ UserPrefs }, id) => {
    if (!id) {
      return id;
    }

    const userPrefsModel = UserPrefs.withId(id);

    if (!userPrefsModel) {
      return userPrefsModel;
    }

    return userPrefsModel.ref;
  },
);

export default {
  selectCurrentUserPrefs,
};
