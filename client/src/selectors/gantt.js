import { createSelector } from 'redux-orm';

import orm from '../orm';
import { getCardColor } from '../utils/board-colors';
import { selectCurrentUserId } from './users';

// Composes project-wide scheduling data (boards → lists → cards, members) consumed by both
// the Gantt and Team Planner pages. Reads whatever board data is loaded into the ORM; the
// container is responsible for ensuring boards are fetched.
export const makeSelectSchedulingData = () =>
  createSelector(
    orm,
    (_, projectId) => projectId,
    (state) => selectCurrentUserId(state),
    ({ Project, User, ProjectMembership, ProjectManager }, projectId, userId) => {
      if (!projectId) {
        return null;
      }

      const projectModel = Project.withId(projectId);
      if (!projectModel) {
        return null;
      }

      const userModel = User.withId(userId);
      const isAdmin = !!(userModel && userModel.isAdmin);

      const boardModels = projectModel.getOrderedBoardsModelArrayAvailableForUser(userId);

      const boards = [];
      const cards = [];

      // Gantt is admin-edit-only: everyone else views. Team Planner layers its own "own row"
      // edit rule (member is one of the card's assignees) on top of this base flag client-side.
      const canEdit = isAdmin;

      boardModels.forEach((boardModel) => {
        const lists = boardModel
          .getOrderedListsQuerySet()
          .toModelArray()
          .map((listModel) => {
            const listCards = listModel.getOrderedCardsModelArray().map((cardModel) => {
              const memberUserIds = cardModel.users.toRefArray().map((user) => user.id);

              const card = {
                id: cardModel.id,
                name: cardModel.name,
                startDate: cardModel.startDate,
                dueDate: cardModel.dueDate,
                color: getCardColor(boardModel.id, cardModel.id),
                boardId: boardModel.id,
                boardName: boardModel.name,
                listId: listModel.id,
                listName: listModel.name,
                memberUserIds,
                canEdit,
              };

              cards.push(card);
              return card;
            });

            return { id: listModel.id, name: listModel.name, cards: listCards };
          });

        boards.push({ id: boardModel.id, name: boardModel.name, canEdit, isLoaded: boardModel.ref.isFetching === false, lists });
      });

      const memberUserIdSet = new Set();
      ProjectManager.filter({ projectId })
        .toRefArray()
        .forEach((pm) => memberUserIdSet.add(pm.userId));
      ProjectMembership.filter({ projectId })
        .toRefArray()
        .forEach((pm) => memberUserIdSet.add(pm.userId));

      const members = Array.from(memberUserIdSet)
        .map((id) => {
          const model = User.withId(id);
          return model ? { id: model.id, name: model.name, avatarUrl: model.avatarUrl } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      return { boards, cards, members, currentUserId: userId, isAdmin };
    },
  );

export const selectSchedulingData = makeSelectSchedulingData();

export default {
  makeSelectSchedulingData,
  selectSchedulingData,
};
