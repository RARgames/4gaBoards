import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectBoardTemplatesForCurrentUser = createSelector(orm, ({ BoardTemplate }) => {
  return BoardTemplate.all()
    .toRefArray()
    .sort((a, b) => a.name.localeCompare(b.name));
});

export default {
  selectBoardTemplatesForCurrentUser,
};
