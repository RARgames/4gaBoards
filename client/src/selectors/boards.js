import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';
import { sortByCurrentUserAndName } from '../utils/membership-helpers';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';

export const makeSelectBoardById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Board }, id) => {
      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return {
        ...boardModel.ref,
        ...getMeta(boardModel),
      };
    },
  );

export const selectBoardById = makeSelectBoardById();

export const selectCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return {
      ...boardModel.ref,
      ...getMeta(boardModel),
    };
  },
);

export const selectMembershipsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const memberships = boardModel
      .getOrderedMembershipsQuerySet()
      .toModelArray()
      .map((boardMembershipModel) => ({
        ...boardMembershipModel.ref,
        isPersisted: !isLocalId(boardMembershipModel.id),
        user: {
          ...boardMembershipModel.user.ref,
          isCurrent: boardMembershipModel.user.id === currentUserId,
        },
      }));

    return sortByCurrentUserAndName(memberships);
  },
);

// This returns all memberships for the current board without duplicates (board, card, task memberships)
export const selectBoardCardAndTaskMembershipsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) return id;

    const boardModel = Board.withId(id);
    if (!boardModel) return boardModel;

    const memberships = new Map();

    boardModel
      .getOrderedMembershipsQuerySet()
      .toModelArray()
      .forEach((boardMembershipModel) => {
        const membership = {
          ...boardMembershipModel.ref,
          isPersisted: !isLocalId(boardMembershipModel.id),
          user: {
            ...boardMembershipModel.user.ref,
            isCurrent: boardMembershipModel.user.id === currentUserId,
          },
        };
        memberships.set(membership.user.id, membership);
      });

    boardModel.cards.toModelArray().forEach((card) => {
      card.users.toModelArray().forEach((user) => {
        if (!memberships.has(user.id)) {
          memberships.set(user.id, {
            isPersisted: !isLocalId(user.id),
            user: {
              ...user.ref,
              isCurrent: user.id === currentUserId,
            },
          });
        }
      });
      card
        .getOrderedTasksQuerySet()
        .toModelArray()
        .forEach((task) => {
          task.users.toModelArray().forEach((user) => {
            if (!memberships.has(user.id)) {
              memberships.set(user.id, {
                isPersisted: !isLocalId(user.id),
                user: {
                  ...user.ref,
                  isCurrent: user.id === currentUserId,
                },
              });
            }
          });
        });
    });

    return sortByCurrentUserAndName(Array.from(memberships.values()));
  },
);

export const selectCurrentUserMembershipForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const boardMembershipModel = boardModel.getMembershipModelForUser(currentUserId);

    if (!boardMembershipModel) {
      return boardMembershipModel;
    }

    return boardMembershipModel.ref;
  },
);

export const selectLabelsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const labels = boardModel
      .getOrderedLabelsQuerySet()
      .toRefArray()
      .map((label) => ({
        ...label,
        isPersisted: !isLocalId(label.id),
      }));

    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
);

export const selectListIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedListsQuerySet()
      .toRefArray()
      .map((list) => list.id);
  },
);

export const selectFilterUsersForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterUsers.toRefArray();
  },
);

export const selectFilterLabelsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterLabels.toRefArray();
  },
);

export const selectIsFilteredForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }
    const filterUsersArray = boardModel.filterUsers.toRefArray();
    const filterLabelsArray = boardModel.filterLabels.toRefArray();
    const { searchParams } = boardModel;

    return filterUsersArray.length !== 0 || filterLabelsArray.length !== 0 || searchParams.query !== '' || searchParams.dueDate !== null;
  },
);

export const selectBoardSearchParamsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.searchParams;
  },
);

export const selectIsBoardWithIdExists = createSelector(
  orm,
  (_, id) => id,
  ({ Board }, id) => Board.idExists(id),
);

export const selectCardsCountForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const listModels = boardModel.getOrderedListsQuerySet().toModelArray();

    const cardsCount = listModels.map((list) => list.getOrderedCardsQuerySet().count()).reduce((total, count) => total + count, 0);

    return cardsCount;
  },
);

export const selectFilteredCardsCountForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const listModels = boardModel.getOrderedListsQuerySet().toModelArray();

    const filteredCardsCount = listModels.map((list) => list.getFilteredOrderedCardsModelArray().length).reduce((total, count) => total + count, 0);
    return filteredCardsCount;
  },
);

export default {
  makeSelectBoardById,
  selectBoardById,
  selectCurrentBoard,
  selectMembershipsForCurrentBoard,
  selectBoardCardAndTaskMembershipsForCurrentBoard,
  selectCurrentUserMembershipForCurrentBoard,
  selectLabelsForCurrentBoard,
  selectListIdsForCurrentBoard,
  selectFilterUsersForCurrentBoard,
  selectFilterLabelsForCurrentBoard,
  selectIsFilteredForCurrentBoard,
  selectBoardSearchParamsForCurrentBoard,
  selectIsBoardWithIdExists,
  selectCardsCountForCurrentBoard,
  selectFilteredCardsCountForCurrentBoard,
};
