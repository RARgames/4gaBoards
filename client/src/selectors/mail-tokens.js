import { createSelector } from 'redux-orm';

import orm from '../orm';
import { getMailTokens } from './helpers/mail-tokens';
import { selectCurrentUserId } from './users';

export const makeSelectMailTokensByListId = () =>
  createSelector(
    orm,
    (_, listId) => listId,
    (state) => selectCurrentUserId(state),
    ({ List }, listId, currentUserId) => {
      if (!listId) {
        return listId;
      }

      const listModel = List.withId(listId);
      if (!listModel) {
        return listModel;
      }

      const mailTokens = getMailTokens(listModel, currentUserId);
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
    (state) => selectCurrentUserId(state),
    ({ Board }, boardId, currentUserId) => {
      if (!boardId) {
        return boardId;
      }

      const boardModel = Board.withId(boardId);
      if (!boardModel) {
        return boardModel;
      }

      const mailTokens = getMailTokens(boardModel, currentUserId);
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
