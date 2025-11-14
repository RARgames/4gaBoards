import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

const DEFAULT_EMAIL_UPDATE_FORM = {
  data: {
    email: '',
    currentPassword: '',
  },
  isSubmitting: false,
  error: null,
};

const DEFAULT_PASSWORD_UPDATE_FORM = {
  data: {
    password: '',
    currentPassword: '',
  },
  isSubmitting: false,
  error: null,
};

const DEFAULT_USERNAME_UPDATE_FORM = {
  data: {
    username: '',
    currentPassword: '',
  },
  isSubmitting: false,
  error: null,
};

export default class extends BaseModel {
  static modelName = 'User';

  static fields = {
    id: attr(),
    email: attr(),
    username: attr(),
    name: attr(),
    avatarUrl: attr(),
    phone: attr(),
    organization: attr(),
    isPasswordAuthenticated: attr(),
    ssoGoogleEmail: attr(),
    ssoGithubUsername: attr(),
    ssoGithubEmail: attr(),
    ssoMicrosoftEmail: attr(),
    ssoOidcEmail: attr(),
    lastLogin: attr(),
    isAdmin: attr({
      getDefault: () => false,
    }),
    isAvatarUpdating: attr({
      getDefault: () => false,
    }),
    emailUpdateForm: attr({
      getDefault: () => DEFAULT_EMAIL_UPDATE_FORM,
    }),
    passwordUpdateForm: attr({
      getDefault: () => DEFAULT_PASSWORD_UPDATE_FORM,
    }),
    usernameUpdateForm: attr({
      getDefault: () => DEFAULT_USERNAME_UPDATE_FORM,
    }),
    filter: attr(), // TODO move to userPrefs?
    notificationFilter: attr(), // TODO move to userPrefs?
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdUsers',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedUsers',
    }),
    deletedAt: attr(),
    deletedById: fk({
      to: 'User',
      as: 'deletedBy',
      relatedName: 'deletedUsers',
    }),
  };

  static reducer({ type, payload }, User) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
        if (payload.users) {
          payload.users.forEach((user) => {
            User.upsert(user);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        User.all().delete();

        User.upsert(payload.user);

        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        User.upsert(payload.user);

        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      case ActionTypes.USER_CREATE__SUCCESS:
      case ActionTypes.USER_CREATE_HANDLE:
      case ActionTypes.USER_UPDATE__SUCCESS:
        User.upsert(payload.user);

        break;
      case ActionTypes.USER_UPDATE:
        User.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.USER_UPDATE__FAILURE:
        User.upsert(payload.user);

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
        User.upsert(payload.user);

        if (payload.users) {
          payload.users.forEach((user) => {
            User.upsert(user);
          });
        }

        break;
      case ActionTypes.USER_EMAIL_UPDATE: {
        const userModel = User.withId(payload.id);

        userModel.update({
          emailUpdateForm: {
            ...userModel.emailUpdateForm,
            data: payload.data,
            isSubmitting: true,
          },
        });

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE__SUCCESS: {
        User.withId(payload.user.id).update({
          ...payload.user,
          emailUpdateForm: DEFAULT_EMAIL_UPDATE_FORM,
        });

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE__FAILURE: {
        const userModel = User.withId(payload.id);

        userModel.update({
          emailUpdateForm: {
            ...userModel.emailUpdateForm,
            isSubmitting: false,
            error: payload.error,
          },
        });

        break;
      }
      case ActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.update({
          emailUpdateForm: {
            ...userModel.emailUpdateForm,
            error: null,
          },
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE: {
        const userModel = User.withId(payload.id);

        userModel.update({
          passwordUpdateForm: {
            ...userModel.passwordUpdateForm,
            data: payload.data,
            isSubmitting: true,
          },
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE__SUCCESS: {
        User.withId(payload.user.id).update({
          ...payload.user,
          passwordUpdateForm: DEFAULT_PASSWORD_UPDATE_FORM,
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE__FAILURE: {
        const userModel = User.withId(payload.id);

        userModel.update({
          passwordUpdateForm: {
            ...userModel.passwordUpdateForm,
            isSubmitting: false,
            error: payload.error,
          },
        });

        break;
      }
      case ActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.update({
          passwordUpdateForm: {
            ...userModel.passwordUpdateForm,
            error: null,
          },
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE: {
        const userModel = User.withId(payload.id);

        userModel.update({
          usernameUpdateForm: {
            ...userModel.usernameUpdateForm,
            data: payload.data,
            isSubmitting: true,
          },
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE__SUCCESS: {
        User.withId(payload.user.id).update({
          ...payload.user,
          usernameUpdateForm: DEFAULT_USERNAME_UPDATE_FORM,
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE__FAILURE: {
        const userModel = User.withId(payload.id);

        userModel.update({
          usernameUpdateForm: {
            ...userModel.usernameUpdateForm,
            isSubmitting: false,
            error: payload.error,
          },
        });

        break;
      }
      case ActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR: {
        const userModel = User.withId(payload.id);

        userModel.update({
          usernameUpdateForm: {
            ...userModel.usernameUpdateForm,
            error: null,
          },
        });

        break;
      }
      case ActionTypes.USER_AVATAR_UPDATE:
        User.withId(payload.id).update({
          isAvatarUpdating: true,
        });

        break;
      case ActionTypes.USER_AVATAR_UPDATE__SUCCESS:
        User.withId(payload.user.id).update({
          ...payload.user,
          isAvatarUpdating: false,
        });

        break;
      case ActionTypes.USER_AVATAR_UPDATE__FAILURE:
        User.withId(payload.id).update({
          isAvatarUpdating: false,
        });

        break;
      case ActionTypes.USER_DELETE:
        User.withId(payload.id).update({
          deletedAt: new Date(),
        });

        break;
      case ActionTypes.USER_DELETE__SUCCESS:
      case ActionTypes.USER_DELETE_HANDLE:
        User.withId(payload.user.id).deleteWithRelated(payload.user);

        break;
      case ActionTypes.USER_DELETE__FAILURE:
        User.withId(payload.id).update({
          deletedAt: null,
        });

        break;
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.ACTIVITIES_CARD_FETCH__SUCCESS:
      case ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH__SUCCESS:
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.users.forEach((user) => {
          User.upsert(user);
        });

        break;
      case ActionTypes.USER_FILTER_QUERY_UPDATE:
        if (payload.data.query === '') {
          User.withId(payload.id).update({
            filter: undefined,
          });
        } else {
          User.withId(payload.id).update({
            filter: { query: payload.data.query, target: payload.data.target },
          });
        }

        break;
      case ActionTypes.USER_NOTIFICATION_FILTER_QUERY_UPDATE:
        if (payload.data.query === '') {
          User.withId(payload.id).update({
            notificationFilter: undefined,
          });
        } else {
          User.withId(payload.id).update({
            notificationFilter: { query: payload.data.query, target: payload.data.target },
          });
        }

        break;
      default:
    }
  }

  static getOrderedUndeletedQuerySet() {
    return this.filter({
      deletedAt: null,
    }).orderBy('id');
  }

  getOrderedProjectManagersQuerySet() {
    return this.projectManagers.orderBy('id');
  }

  getOrderedBoardMembershipsQuerySet() {
    return this.boardMemberships.orderBy('id');
  }

  getOrderedUnreadNotificationsQuerySet() {
    return this.notifications
      .filter({
        deletedAt: null,
      })
      .orderBy('createdAt', false);
  }

  getOrderedAvailableProjectsModelArray() {
    const projectIds = [];

    const projectModels = this.getOrderedProjectManagersQuerySet()
      .toModelArray()
      .map(({ project: projectModel }) => {
        projectIds.push(projectModel.id);

        return projectModel;
      });

    this.getOrderedBoardMembershipsQuerySet()
      .toModelArray()
      .forEach(({ board: { project: projectModel } }) => {
        if (projectIds.includes(projectModel.id)) {
          return;
        }

        projectIds.push(projectModel.id);
        projectModels.push(projectModel);
      });

    return projectModels.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  deleteRelated() {
    this.projectManagers.delete();

    this.boardMemberships.toModelArray().forEach((boardMembershipModel) => {
      boardMembershipModel.deleteWithRelated();
    });
  }

  deleteWithRelated(user) {
    this.deleteRelated();

    this.update(
      user || {
        deletedAt: new Date(),
      },
    );
  }
}
