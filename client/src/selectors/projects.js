import { createSelector } from 'redux-orm';

import orm from '../orm';
import getActivityDetails from '../utils/get-activity-details';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';
import { sortByCurrentUserAndName } from '../utils/membership-helpers';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';

export const selectProject = createSelector(
  orm,
  (_, id) => id,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, userId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    const boardsModels = projectModel.getOrderedBoardsModelArrayAvailableForUser(userId);

    return {
      ...projectModel.ref,
      ...getMeta(projectModel),
      firstBoardId: boardsModels[0] && boardsModels[0].id,
    };
  },
);

export const selectCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return {
      ...projectModel.ref,
      ...getMeta(projectModel),
    };
  },
);

export const selectManagersForProject = createSelector(
  orm,
  (_, id) => id,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    const managers = projectModel
      .getOrderedManagersQuerySet()
      .toModelArray()
      .map((projectManagerModel) => ({
        ...projectManagerModel.ref,
        isPersisted: !isLocalId(projectManagerModel.id),
        user: {
          ...projectManagerModel.user.ref,
          isCurrent: projectManagerModel.user.id === currentUserId,
        },
      }));

    return sortByCurrentUserAndName(managers);
  },
);

export const selectBoardsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel.getOrderedBoardsModelArrayAvailableForUser(currentUserId).map((boardModel) => ({
      ...boardModel.ref,
      ...getMeta(boardModel),
      isPersisted: !isLocalId(boardModel.id),
    }));
  },
);

export const selectIsCurrentUserManagerForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return false;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return false;
    }

    return projectModel.hasManagerForUser(currentUserId);
  },
);

export const makeSelectActivitiesByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel
        .getOrderedProjectActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectActivitiesByProjectId = makeSelectActivitiesByProjectId();

export const makeSelectLastActivityIdByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Project }, id) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      const lastActivityModel = projectModel.getOrderedProjectActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
    },
  );

export const selectLastActivityIdByProjectId = makeSelectLastActivityIdByProjectId();

export const makeSelectNotificationsByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Project }, id) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel.getUnreadNotificationsQuerySet().toRefArray();
    },
  );

export const selectNotificationsByProjectId = makeSelectNotificationsByProjectId();

export const makeSelectNotificationsTotalByProjectId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Project }, id) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel.getUnreadNotificationsQuerySet().count();
    },
  );

export const selectNotificationsTotalByProjectId = makeSelectNotificationsTotalByProjectId();

export default {
  selectProject,
  selectCurrentProject,
  selectManagersForProject,
  selectBoardsForCurrentProject,
  selectIsCurrentUserManagerForCurrentProject,
  makeSelectActivitiesByProjectId,
  selectActivitiesByProjectId,
  makeSelectLastActivityIdByProjectId,
  selectLastActivityIdByProjectId,
  makeSelectNotificationsByProjectId,
  selectNotificationsByProjectId,
  makeSelectNotificationsTotalByProjectId,
  selectNotificationsTotalByProjectId,
};
