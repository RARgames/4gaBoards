import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';

export const selectCurrentUserId = ({ auth: { userId } }) => userId;

export const makeSelectUserById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ User }, id) => {
      const userModel = User.withId(id);

      if (!userModel) {
        return userModel;
      }

      return {
        ...userModel.ref,
        ...getMeta(userModel),
      };
    },
  );

export const selectUserById = makeSelectUserById();

export const selectUsers = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, currentUserId) => {
    const users = User.getOrderedUndeletedQuerySet()
      .toModelArray()
      .map((userModel) => ({
        ...userModel.ref,
        ...getMeta(userModel),
      }));

    return users.sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return a.name.localeCompare(b.name);
    });
  },
);

export const selectUsersExceptCurrent = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) =>
    User.getOrderedUndeletedQuerySet()
      .exclude({ id })
      .toRefArray()
      .sort((a, b) => a.name.localeCompare(b.name)),
);

export const selectCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.ref;
  },
);

export const selectProjectsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    const projects = userModel.getOrderedAvailableProjectsModelArray().map((projectModel) => {
      const boardsModels = projectModel.getOrderedBoardsModelArrayAvailableForUser(userModel.id);
      const projectMemberships = new Map();
      projectModel.managerUsers.toRefArray().forEach((user) => {
        projectMemberships.set(user.id, { user });
      });

      let notificationsTotal = 0;
      const boardsRefs = boardsModels.map((boardModel) => {
        let notificationsBoardTotal = 0;
        boardModel.cards.toModelArray().forEach((cardModel) => {
          notificationsTotal += cardModel.getUnreadNotificationsQuerySet().count();
          notificationsBoardTotal += cardModel.getUnreadNotificationsQuerySet().count();
        });

        const boardMemberships = boardModel.memberUsers.toRefArray().map((user) => ({ user }));
        boardMemberships.forEach(({ user }) => {
          if (!projectMemberships.has(user.id)) {
            projectMemberships.set(user.id, { user });
          }
        });

        return {
          ...boardModel.ref,
          memberships: boardMemberships,
          ...getMeta(boardModel),
          notificationsTotal: notificationsBoardTotal,
          isPersisted: !isLocalId(boardModel.id),
        };
      });

      return {
        ...projectModel.ref,
        ...getMeta(projectModel),
        notificationsTotal,
        firstBoardId: boardsModels[0] && boardsModels[0].id,
        boards: boardsRefs,
        memberships: Array.from(projectMemberships.values()),
      };
    });

    let filteredProjects = projects;
    if (userModel.filter) {
      const query = userModel.filter.query.toLowerCase();
      if (userModel.filter.target === 'project') {
        filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(query));
      } else if (userModel.filter.target === 'board') {
        filteredProjects = projects
          .map((project) => ({
            ...project,
            boards: project.boards.filter((board) => board.name.toLowerCase().includes(query)),
          }))
          .filter((project) => project.boards.length > 0);
      }
    }

    return { projects, filteredProjects };
  },
);

export const selectManagedProjectsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel
      .getOrderedAvailableProjectsModelArray()
      .filter((projectModel) => projectModel.hasManagerForUser(id))
      .map((projectModel) => {
        return {
          ...projectModel.ref,
        };
      });
  },
);

export const selectProjectsToListsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.getOrderedAvailableProjectsModelArray().map((projectModel) => ({
      ...projectModel.ref,
      boards: projectModel.getOrderedBoardsModelArrayForUser(id).map((boardModel) => ({
        ...boardModel.ref,
        lists: boardModel.getOrderedListsQuerySet().toRefArray(),
      })),
    }));
  },
);

export const selectNotificationsForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    const notifications = userModel
      .getOrderedUnreadNotificationsQuerySet()
      .toModelArray()
      .map((notificationModel) => ({
        ...notificationModel.ref,
        activity: notificationModel.activity && {
          ...notificationModel.activity.ref,
          user: notificationModel.activity.user.ref,
          board: notificationModel.activity.board && notificationModel.activity.board.ref,
          project: notificationModel.activity.project && notificationModel.activity.project.ref,
        },
        card: notificationModel.card && notificationModel.card.ref,
      }));

    let filteredNotifications = notifications;
    if (userModel.notificationFilter) {
      const query = userModel.notificationFilter.query.toLowerCase();
      switch (userModel.notificationFilter.target) {
        case 'project':
          filteredNotifications = notifications.filter((notification) => notification.activity?.project?.name?.toLowerCase().includes(query));
          break;
        case 'board':
          filteredNotifications = notifications.filter((notification) => notification.activity?.board?.name?.toLowerCase().includes(query));
          break;
        case 'user':
          filteredNotifications = notifications.filter((notification) => {
            const user = notification.activity?.user;
            if (!user) return false;
            return user.name?.toLowerCase().includes(query) || user.username?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
          });
          break;
        case 'card':
          filteredNotifications = notifications.filter((notification) => (notification.card?.name ?? notification.activity?.data?.cardName)?.toLowerCase().includes(query));
          break;
        case 'text':
          filteredNotifications = notifications.filter((notification) => {
            const { activity } = notification;
            return activity && (activity.type.toLowerCase().includes(query) || (activity.data && Object.values(activity.data).some((val) => String(val).toLowerCase().includes(query))));
          });
          break;
        case 'aggregated':
          filteredNotifications = notifications.filter((notification) => {
            const { activity } = notification;
            const inProject = activity?.project?.name?.toLowerCase().includes(query);
            const inBoard = activity?.board?.name?.toLowerCase().includes(query);
            const inUser = activity?.user && (activity.user.name?.toLowerCase().includes(query) || activity.user.username?.toLowerCase().includes(query) || activity.user.email?.toLowerCase().includes(query));
            const inCard = (notification.card?.name ?? notification.activity?.data?.cardName)?.toLowerCase().includes(query);
            const inTypeOrData = activity && (activity.type.toLowerCase().includes(query) || (activity.data && Object.values(activity.data).some((val) => String(val).toLowerCase().includes(query))));
            return inCard || inBoard || inProject || inUser || inTypeOrData;
          });
          break;
        default:
          break;
      }
    }

    return { notifications, filteredNotifications };
  },
);

export const selectFilterForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return userModel.filter;
  },
);

export const selectIsFilteredForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ User }, id) => {
    if (!id) {
      return id;
    }

    const userModel = User.withId(id);

    if (!userModel) {
      return userModel;
    }

    return !!userModel.filter;
  },
);

export default {
  selectCurrentUserId,
  makeSelectUserById,
  selectUserById,
  selectUsers,
  selectUsersExceptCurrent,
  selectCurrentUser,
  selectProjectsForCurrentUser,
  selectManagedProjectsForCurrentUser,
  selectProjectsToListsForCurrentUser,
  selectNotificationsForCurrentUser,
  selectFilterForCurrentUser,
  selectIsFilteredForCurrentUser,
};
