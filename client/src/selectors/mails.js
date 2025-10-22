import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { selectCurrentUserId } from './users';

export const makeSelectMailForCurrentUserByListId = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    (_, listId) => listId,
    (session, currentUserId, listId) => {
      if (!currentUserId || !listId) return null;
      const { Mail } = session;
      if (!Mail) return null;
      const mailModel = Mail.all()
        .toModelArray()
        .find((mail) => mail.listId === listId && mail.userId === currentUserId);
      if (!mailModel) return null;
      return { ...mailModel.ref, ...getMeta(mailModel) };
    },
  );
export const selectMailForCurrentUserByListId = makeSelectMailForCurrentUserByListId();

export default {
  makeSelectMailForCurrentUserByListId,
  selectMailForCurrentUserByListId,
};
