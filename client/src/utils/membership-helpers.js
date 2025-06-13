import { isLocalId } from './local-id';

const sortByCurrentUserAndName = (memberships) =>
  memberships.sort((a, b) => {
    if (a.user.isCurrent) return -1;
    if (b.user.isCurrent) return 1;
    return a.user.name.localeCompare(b.user.name);
  });

const addBoardMemberships = (boardModel, memberships, currentUserId) => {
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
};

const addCardMemberships = (cardModel, memberships, currentUserId) => {
  cardModel.users.toModelArray().forEach((user) => {
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
};

const addTaskMemberships = (cardModel, userMap, currentUserId) => {
  cardModel
    .getOrderedTasksQuerySet()
    .toModelArray()
    .forEach((task) => {
      task.users.toModelArray().forEach((user) => {
        if (!userMap.has(user.id)) {
          userMap.set(user.id, {
            isPersisted: !isLocalId(user.id),
            user: {
              ...user.ref,
              isCurrent: user.id === currentUserId,
            },
          });
        }
      });
    });
};

export { sortByCurrentUserAndName, addBoardMemberships, addCardMemberships, addTaskMemberships };
