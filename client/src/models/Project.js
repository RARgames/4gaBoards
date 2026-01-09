import { attr, many, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';
import { ProjectBackgroundTypes } from '../constants/Enums';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Project';

  static fields = {
    id: attr(),
    name: attr(),
    background: attr(),
    backgroundImage: attr(),
    isCollapsed: attr(),
    isBackgroundImageUpdating: attr({
      getDefault: () => false,
    }),
    managerUsers: many({
      to: 'User',
      through: 'ProjectManager',
      relatedName: 'projects',
    }),
    isActivitiesFetching: attr({
      getDefault: () => false,
    }),
    isAllActivitiesFetched: attr({
      getDefault: () => false,
    }),
    lastActivityId: attr(),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdProjects',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedProjects',
    }),
  };

  static reducer({ type, payload }, Project) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
        if (payload.projects) {
          payload.projects.forEach((project) => {
            Project.upsert(project);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Project.all().delete();

        payload.projects.forEach((project) => {
          Project.upsert(project);
        });

        payload.userProjects.forEach((userProject) => {
          Project.withId(userProject.projectId)?.update({
            // TODO ? - hacky way to fix #311 - remove later
            isCollapsed: userProject.isCollapsed,
          });
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.projects.forEach((project) => {
          Project.upsert(project);
        });

        if (payload.userProjects) {
          payload.userProjects.forEach((userProject) => {
            Project.withId(userProject.projectId)?.update({
              // TODO ? - hacky way to fix #311 - remove later
              isCollapsed: userProject.isCollapsed,
            });
          });
        }

        break;
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_IMPORT_GETTING_STARTED__SUCCESS:
        Project.upsert(payload.project);

        break;
      case ActionTypes.PROJECT_UPDATE: {
        const project = Project.withId(payload.id);
        project.update(payload.data);

        if (payload.data.backgroundImage === null && project.background && project.background.type === ProjectBackgroundTypes.IMAGE) {
          project.background = null;
        }

        break;
      }
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE:
        Project.withId(payload.id).update({
          isBackgroundImageUpdating: true,
        });

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE__SUCCESS:
        Project.withId(payload.project.id).update({
          ...payload.project,
          isBackgroundImageUpdating: false,
        });

        break;
      case ActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE__FAILURE:
        Project.withId(payload.id).update({
          isBackgroundImageUpdating: false,
        });

        break;
      case ActionTypes.PROJECT_DELETE:
        Project.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.PROJECT_DELETE__SUCCESS:
      case ActionTypes.PROJECT_DELETE_HANDLE: {
        const projectModel = Project.withId(payload.project.id);

        if (projectModel) {
          projectModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.project) {
          const projectModel = Project.withId(payload.project.id);

          if (projectModel) {
            projectModel.deleteWithRelated();
          }

          const { project } = payload;
          if (payload.userProject) {
            project.isCollapsed = payload.userProject.isCollapsed;
          }

          Project.upsert(project);
        }

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE__PROJECT_FETCH:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE__PROJECT_FETCH: {
        const projectModel = Project.withId(payload.id);

        if (projectModel) {
          projectModel.boards.toModelArray().forEach((boardModel) => {
            if (boardModel.id !== payload.currentBoardId) {
              boardModel.update({
                isFetching: null,
              });

              boardModel.deleteRelated(payload.currentUserId);
            }
          });
        }

        break;
      }

      case ActionTypes.USER_PROJECT_UPDATE: {
        const projectModel = Project.withId(payload.id);
        if (projectModel) {
          projectModel.update({
            isCollapsed: payload.data.isCollapsed,
          });
        }

        break;
      }

      case ActionTypes.USER_PROJECT_UPDATE__SUCCESS:
      case ActionTypes.USER_PROJECT_UPDATE_HANDLE: {
        const projectModel = Project.withId(payload.userProject.projectId);
        if (projectModel) {
          projectModel.update({
            isCollapsed: payload.userProject.isCollapsed,
          });
        }

        break;
      }
      case ActionTypes.ACTIVITIES_PROJECT_FETCH:
        Project.withId(payload.projectId).update({
          isActivitiesFetching: true,
        });

        break;
      case ActionTypes.ACTIVITIES_PROJECT_FETCH__SUCCESS:
        Project.withId(payload.projectId).update({
          isActivitiesFetching: false,
          isAllActivitiesFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
          lastActivityId: payload.activities.length > 0 ? payload.activities[payload.activities.length - 1].id : Project.withId(payload.projectId).lastActivityId,
        });

        break;
      default:
    }
  }

  getOrderedManagersQuerySet() {
    return this.managers.orderBy('id');
  }

  getOrderedBoardsQuerySet() {
    return this.boards.orderBy('position');
  }

  getOrderedBoardsModelArrayForUser(userId) {
    return this.getOrderedBoardsQuerySet()
      .toModelArray()
      .filter((boardModel) => boardModel.hasMembershipForUser(userId));
  }

  getOrderedBoardsModelArrayAvailableForUser(userId) {
    if (this.hasManagerForUser(userId)) {
      return this.getOrderedBoardsQuerySet().toModelArray();
    }

    return this.getOrderedBoardsModelArrayForUser(userId);
  }

  getOrderedActivitiesQuerySet() {
    return this.activities.filter({ notificationOnly: false }).orderBy('createdAt', false);
  }

  getUnreadNotificationsQuerySet() {
    return this.notifications.filter({
      isRead: false,
      deletedAt: null,
    });
  }

  hasManagerForUser(userId) {
    return this.managers
      .filter({
        userId,
      })
      .exists();
  }

  hasMembershipInAnyBoardForUser(userId) {
    return this.boards.toModelArray().some((boardModel) => boardModel.hasMembershipForUser(userId));
  }

  isAvailableForUser(userId) {
    return this.hasManagerForUser(userId) || this.hasMembershipInAnyBoardForUser(userId);
  }

  deleteRelated() {
    this.managers.delete();

    this.boards.toModelArray().forEach((boardModel) => {
      boardModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
