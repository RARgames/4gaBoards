import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { selectCurrentUserId } from './users';

export const makeSelectMailTokenForCurrentUserByListId = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    (_, listId) => listId,
    (session, currentUserId, listId) => {
      if (!currentUserId || !listId) return null;
      const { MailToken } = session;
      if (!MailToken) return null;
      const mailTokenModel = MailToken.all()
        .toModelArray()
        .find((mailToken) => mailToken.listId === listId && mailToken.userId === currentUserId);
      if (!mailTokenModel) return null;
      return { ...mailTokenModel.ref, ...getMeta(mailTokenModel) };
    },
  );
export const selectMailTokenForCurrentUserByListId = makeSelectMailTokenForCurrentUserByListId();

export const makeSelectMailTokensByListId = () =>
  createSelector(
    orm,
    (_, listId) => listId,
    (session, listId) => {
      if (!listId) return [];

      const { MailToken } = session;
      if (!MailToken) return [];

      const mailTokenModels = MailToken.all().filter({ listId }).toModelArray();

      return mailTokenModels.map((mailTokenModel) => ({
        ...mailTokenModel.ref,
        ...getMeta(mailTokenModel),
        user: mailTokenModel.user?.ref || null,
      }));
    },
  );

export const selectMailTokensByListId = makeSelectMailTokensByListId();

export const makeSelectMailTokenForCurrentUserByBoardId = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    (_, boardId) => boardId,
    (session, currentUserId, boardId) => {
      if (!currentUserId || !boardId) return null;
      const { MailToken } = session;
      if (!MailToken) return null;

      const mailTokenModel = MailToken.all()
        .toModelArray()
        .find((mailToken) => mailToken.boardId === boardId && mailToken.userId === currentUserId && (mailToken.listId === null || mailToken.listId === undefined));

      if (!mailTokenModel) return null;

      return { ...mailTokenModel.ref, ...getMeta(mailTokenModel) };
    },
  );

export const selectMailTokenForCurrentUserByBoardId = makeSelectMailTokenForCurrentUserByBoardId();

export const makeSelectMailTokenCountForBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    (session, boardId) => {
      if (!boardId) return 0;

      const { MailToken } = session;
      if (!MailToken) return 0;

      const mailTokenModels = MailToken.all()
        .filter({ boardId })
        .toModelArray()
        .filter((mailToken) => mailToken.listId === null || mailToken.listId === undefined);

      return mailTokenModels.length;
    },
  );

export const selectMailTokenCountForBoardId = makeSelectMailTokenCountForBoardId();

export const makeSelectMailTokensByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    (session, boardId) => {
      if (!boardId) return [];

      const { MailToken, List, Board } = session;
      if (!MailToken) return [];

      const boardModel = Board.withId(boardId);

      const mailTokenModels = MailToken.all().filter({ boardId }).toModelArray();

      return mailTokenModels.map((mailTokenModel) => {
        const isBoardLevel = mailTokenModel.listId === null || mailTokenModel.listId === undefined;

        const listModel = isBoardLevel ? null : List.withId(mailTokenModel.listId);

        return {
          ...mailTokenModel.ref,
          ...getMeta(mailTokenModel),
          user: mailTokenModel.user?.ref || null,
          contextType: isBoardLevel ? 'board' : 'list',
          contextName: isBoardLevel ? boardModel?.name || 'Board' : listModel?.name || 'List',
        };
      });
    },
  );

export const selectMailTokensByBoardId = makeSelectMailTokensByBoardId();

export default {
  makeSelectMailTokenForCurrentUserByListId,
  selectMailTokenForCurrentUserByListId,
  makeSelectMailTokensByListId,
  selectMailTokensByListId,
  makeSelectMailTokenForCurrentUserByBoardId,
  selectMailTokenForCurrentUserByBoardId,
  makeSelectMailTokensByBoardId,
  selectMailTokensByBoardId,
  makeSelectMailTokenCountForBoardId,
  selectMailTokenCountForBoardId,
};
