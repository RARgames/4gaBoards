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

export const makeSelectMailsByListId = () =>
  createSelector(
    orm,
    (_, listId) => listId,
    (session, listId) => {
      if (!listId) return [];

      const { Mail } = session;
      if (!Mail) return [];

      const mailModels = Mail.all().filter({ listId }).toModelArray();

      return mailModels.map((mailModel) => ({
        ...mailModel.ref,
        ...getMeta(mailModel),
        user: mailModel.user?.ref || null,
      }));
    },
  );

export const selectMailsByListId = makeSelectMailsByListId();

export default {
  makeSelectMailForCurrentUserByListId,
  selectMailForCurrentUserByListId,
  makeSelectMailsByListId,
  selectMailsByListId,
};
