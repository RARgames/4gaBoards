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

export const makeSelectMailForCurrentUserByBoardId = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    (_, boardId) => boardId,
    (session, currentUserId, boardId) => {
      if (!currentUserId || !boardId) return null;
      const { Mail } = session;
      if (!Mail) return null;

      const mailModel = Mail.all()
        .toModelArray()
        .find((mail) => mail.boardId === boardId && mail.userId === currentUserId && (mail.listId === null || mail.listId === undefined));

      if (!mailModel) return null;

      return { ...mailModel.ref, ...getMeta(mailModel) };
    },
  );

export const selectMailForCurrentUserByBoardId = makeSelectMailForCurrentUserByBoardId();

export const makeSelectMailCountForBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    (session, boardId) => {
      if (!boardId) return 0;

      const { Mail } = session;
      if (!Mail) return 0;

      const mailModels = Mail.all()
        .filter({ boardId })
        .toModelArray()
        .filter((mail) => mail.listId === null || mail.listId === undefined);

      return mailModels.length;
    },
  );

export const selectMailCountForBoardId = makeSelectMailCountForBoardId();

export const makeSelectMailsByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    (session, boardId) => {
      if (!boardId) return [];

      const { Mail, List, Board } = session;
      if (!Mail) return [];

      const boardModel = Board.withId(boardId);

      const mailModels = Mail.all().filter({ boardId }).toModelArray();

      return mailModels.map((mailModel) => {
        const isBoardLevel = mailModel.listId === null || mailModel.listId === undefined;

        const listModel = isBoardLevel ? null : List.withId(mailModel.listId);

        return {
          ...mailModel.ref,
          ...getMeta(mailModel),
          user: mailModel.user?.ref || null,
          contextType: isBoardLevel ? 'board' : 'list',
          contextName: isBoardLevel ? boardModel?.name || 'Board' : listModel?.name || 'List',
        };
      });
    },
  );

export const selectMailsByBoardId = makeSelectMailsByBoardId();

export default {
  makeSelectMailForCurrentUserByListId,
  selectMailForCurrentUserByListId,
  makeSelectMailsByListId,
  selectMailsByListId,
  makeSelectMailForCurrentUserByBoardId,
  selectMailForCurrentUserByBoardId,
  makeSelectMailsByBoardId,
  selectMailsByBoardId,
  makeSelectMailCountForBoardId,
  selectMailCountForBoardId,
};
