import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectMailTokensByListId = () =>
  createSelector(
    orm,
    (_, listId) => listId,
    ({ List }, listId) => {
      if (!listId) {
        return listId;
      }

      const listModel = List.withId(listId);
      if (!listModel) {
        return listModel;
      }

      const mailTokens = listModel.getOrderedMailTokensModelArray().map((mailTokenModel) => ({
        ...mailTokenModel.ref,
        user: mailTokenModel.user?.ref || null,
      }));
      return mailTokens;
    },
  );

export const selectMailTokensByListId = makeSelectMailTokensByListId();

export const makeSelectMailTokenCountByListId = () =>
  createSelector(
    orm,
    (_, listId) => listId,
    ({ List }, listId) => {
      if (!listId) {
        return listId;
      }

      const listModel = List.withId(listId);
      if (!listModel) {
        return listModel;
      }

      return listModel.getOrderedMailTokensQuerySet().count();
    },
  );

export const selectMailTokenCountByListId = makeSelectMailTokenCountByListId();

export const makeSelectMailTokensByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    ({ Board }, boardId) => {
      if (!boardId) {
        return boardId;
      }

      const boardModel = Board.withId(boardId);
      if (!boardModel) {
        return boardModel;
      }

      const mailTokens = boardModel.getOrderedMailTokensModelArray().map((mailTokenModel) => ({
        ...mailTokenModel.ref,
        user: mailTokenModel.user?.ref || null,
      }));
      return mailTokens;
    },
  );

export const selectMailTokensByBoardId = makeSelectMailTokensByBoardId();

export const makeSelectMailTokenCountByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    ({ Board }, boardId) => {
      if (!boardId) {
        return boardId;
      }

      const boardModel = Board.withId(boardId);
      if (!boardModel) {
        return boardModel;
      }

      return boardModel.getOrderedMailTokensQuerySet().count();
    },
  );

export const selectMailTokenCountByBoardId = makeSelectMailTokenCountByBoardId();

export default {
  makeSelectMailTokensByListId,
  selectMailTokensByListId,
  makeSelectMailTokenCountByListId,
  selectMailTokenCountByListId,
  makeSelectMailTokensByBoardId,
  selectMailTokensByBoardId,
  makeSelectMailTokenCountByBoardId,
  selectMailTokenCountByBoardId,
};
