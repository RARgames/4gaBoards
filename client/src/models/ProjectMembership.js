import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'ProjectMembership';

  static fields = {
    id: attr(),
    role: attr(),
    canEditWiki: attr(),
    canManageDocuments: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'memberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'projectMemberships',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdProjectMemberships',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedProjectMemberships',
    }),
  };

  static reducer({ type, payload }, ProjectMembership) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectMembership.all().delete();

        if (payload.projectMemberships) {
          payload.projectMemberships.forEach((projectMembership) => {
            ProjectMembership.upsert(projectMembership);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
        if (payload.projectMemberships) {
          payload.projectMemberships.forEach((projectMembership) => {
            ProjectMembership.upsert(projectMembership);
          });
        }

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE:
        ProjectMembership.upsert(payload.projectMembership);

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE__SUCCESS:
        ProjectMembership.withId(payload.localId).delete();
        ProjectMembership.upsert(payload.projectMembership);

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_CREATE_HANDLE:
        ProjectMembership.upsert(payload.projectMembership);

        if (payload.projectMemberships) {
          payload.projectMemberships.forEach((projectMembership) => {
            ProjectMembership.upsert(projectMembership);
          });
        }

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_UPDATE:
        ProjectMembership.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_UPDATE__SUCCESS:
      case ActionTypes.PROJECT_MEMBERSHIP_UPDATE_HANDLE:
        ProjectMembership.upsert(payload.projectMembership);

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_DELETE:
        ProjectMembership.withId(payload.id).delete();

        break;
      case ActionTypes.PROJECT_MEMBERSHIP_DELETE__SUCCESS:
      case ActionTypes.PROJECT_MEMBERSHIP_DELETE_HANDLE: {
        const projectMembershipModel = ProjectMembership.withId(payload.projectMembership.id);

        if (projectMembershipModel) {
          projectMembershipModel.delete();
        }

        break;
      }
      case ActionTypes.PROJECT_MEMBERSHIP_DELETE__FAILURE:
        ProjectMembership.upsert(payload.projectMembership);

        break;
      default:
    }
  }
}
