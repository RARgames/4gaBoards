import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';
import { sortByCurrentUserAndName } from '../utils/membership-helpers';
import { getPrimaryUserId, UNASSIGNED_LANE_ID } from '../utils/swimlane-helpers';
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

export const selectFilterPrioritiesForCurrentBoard = createSelector(
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

    return boardModel.filterPriorities || [];
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
    const filterPrioritiesArray = boardModel.filterPriorities || [];
    const { searchParams } = boardModel;

    return (
      filterUsersArray.length !== 0 ||
      filterLabelsArray.length !== 0 ||
      filterPrioritiesArray.length !== 0 ||
      searchParams.query !== '' ||
      searchParams.dueDate !== null
    );
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

// Swimlanes: one lane per user with at least one card on the board (placed by stable primary
// assignee), plus an "Unassigned" lane when any card has no assignee. Current user sorts first.
export const selectSwimlanesForCurrentBoard = createSelector(
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

    const usersById = new Map();
    let hasUnassigned = false;

    boardModel.cards.toModelArray().forEach((cardModel) => {
      const primaryUserId = getPrimaryUserId(cardModel);

      if (primaryUserId === UNASSIGNED_LANE_ID) {
        hasUnassigned = true;
        return;
      }

      if (!usersById.has(primaryUserId)) {
        const userModel = cardModel.users.toModelArray().find((user) => user.id === primaryUserId);
        usersById.set(primaryUserId, {
          ...userModel.ref,
          isCurrent: primaryUserId === currentUserId,
        });
      }
    });

    const lanes = Array.from(usersById.values())
      .sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((user) => ({ id: user.id, user, isUnassigned: false }));

    if (hasUnassigned) {
      lanes.push({ id: UNASSIGNED_LANE_ID, user: null, isUnassigned: true });
    }

    return lanes;
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
  selectFilterPrioritiesForCurrentBoard,
  selectIsFilteredForCurrentBoard,
  selectBoardSearchParamsForCurrentBoard,
  selectIsBoardWithIdExists,
  selectCardsCountForCurrentBoard,
  selectFilteredCardsCountForCurrentBoard,
  selectSwimlanesForCurrentBoard,
};
