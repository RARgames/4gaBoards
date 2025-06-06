import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'ProjectManager';

  static fields = {
    id: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'managers',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'projectManagers',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdProjectManagers',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedProjectManagers',
    }),
  };

  static reducer({ type, payload }, ProjectManager) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ProjectManager.all().delete();

        payload.projectManagers.forEach((projectManager) => {
          ProjectManager.upsert(projectManager);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_IMPORT_GETTING_STARTED__SUCCESS:
        payload.projectManagers.forEach((projectManager) => {
          ProjectManager.upsert(projectManager);
        });

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE:
        ProjectManager.upsert(payload.projectManager);

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE__SUCCESS:
        ProjectManager.withId(payload.localId).delete();
        ProjectManager.upsert(payload.projectManager);

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
        ProjectManager.upsert(payload.projectManager);

        if (payload.projectManagers) {
          payload.projectManagers.forEach((projectManager) => {
            ProjectManager.upsert(projectManager);
          });
        }

        break;
      case ActionTypes.PROJECT_MANAGER_DELETE:
        ProjectManager.withId(payload.id).delete();

        break;
      case ActionTypes.PROJECT_MANAGER_DELETE__SUCCESS:
      case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE: {
        const projectManagerModel = ProjectManager.withId(payload.projectManager.id);

        if (projectManagerModel) {
          projectManagerModel.delete();
        }

        break;
      }
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.projectManagers) {
          payload.projectManagers.forEach((projectManager) => {
            ProjectManager.upsert(projectManager);
          });
        }

        break;
      default:
    }
  }
}
