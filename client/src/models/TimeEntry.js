import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'TimeEntry';

  static fields = {
    id: attr(),
    startedAt: attr(),
    endedAt: attr(),
    description: attr(),
    categoryTagId: attr(),
    importedFrom: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'timeEntries',
    }),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'timeEntries',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'timeEntries',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdTimeEntries',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedTimeEntries',
    }),
  };

  static reducer({ type, payload }, TimeEntry) {
    switch (type) {
      case ActionTypes.TIME_ENTRIES_FETCH__SUCCESS:
        payload.timeEntries.forEach((timeEntry) => {
          TimeEntry.upsert(timeEntry);
        });

        break;
      case ActionTypes.TIME_ENTRY_CREATE:
        TimeEntry.upsert(payload.timeEntry);

        break;
      case ActionTypes.TIME_ENTRY_CREATE__SUCCESS:
        TimeEntry.withId(payload.localId).delete();
        TimeEntry.upsert(payload.timeEntry);

        break;
      case ActionTypes.TIME_ENTRY_CREATE__FAILURE: {
        const timeEntryModel = TimeEntry.withId(payload.localId);

        if (timeEntryModel) {
          timeEntryModel.delete();
        }

        break;
      }
      case ActionTypes.TIME_ENTRY_CREATE_HANDLE:
        TimeEntry.upsert(payload.timeEntry);

        break;
      case ActionTypes.TIME_ENTRY_UPDATE:
        TimeEntry.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.TIME_ENTRY_UPDATE__SUCCESS:
      case ActionTypes.TIME_ENTRY_UPDATE_HANDLE: {
        const timeEntryModel = TimeEntry.withId(payload.timeEntry.id);

        if (timeEntryModel) {
          timeEntryModel.update(payload.timeEntry);
        } else {
          TimeEntry.upsert(payload.timeEntry);
        }

        break;
      }
      case ActionTypes.TIME_ENTRY_DELETE:
        TimeEntry.withId(payload.id).delete();

        break;
      case ActionTypes.TIME_ENTRY_DELETE__SUCCESS:
      case ActionTypes.TIME_ENTRY_DELETE_HANDLE: {
        const timeEntryModel = TimeEntry.withId(payload.timeEntry.id);

        if (timeEntryModel) {
          timeEntryModel.delete();
        }

        break;
      }
      default:
    }
  }
}
