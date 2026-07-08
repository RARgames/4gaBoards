import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Document';

  static fields = {
    id: attr(),
    folder: attr(),
    name: attr(),
    description: attr(),
    url: attr(),
    coverUrl: attr(),
    image: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'documents',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdDocuments',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedDocuments',
    }),
  };

  static reducer({ type, payload }, Document) {
    switch (type) {
      case ActionTypes.DOCUMENTS_FETCH__SUCCESS:
        payload.documents.forEach((document) => {
          Document.upsert(document);
        });

        break;
      case ActionTypes.DOCUMENT_CREATE:
        Document.upsert(payload.document);

        break;
      case ActionTypes.DOCUMENT_CREATE__SUCCESS:
        Document.withId(payload.localId).delete();
        Document.upsert(payload.document);

        break;
      case ActionTypes.DOCUMENT_CREATE__FAILURE: {
        const documentModel = Document.withId(payload.localId);

        if (documentModel) {
          documentModel.delete();
        }

        break;
      }
      case ActionTypes.DOCUMENT_CREATE_HANDLE:
        Document.upsert(payload.document);

        break;
      case ActionTypes.DOCUMENT_UPDATE:
        Document.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.DOCUMENT_UPDATE__SUCCESS:
      case ActionTypes.DOCUMENT_UPDATE_HANDLE: {
        const documentModel = Document.withId(payload.document.id);

        if (documentModel) {
          documentModel.update(payload.document);
        } else {
          Document.upsert(payload.document);
        }

        break;
      }
      case ActionTypes.DOCUMENT_DELETE: {
        const documentModel = Document.withId(payload.id);

        if (documentModel) {
          documentModel.delete();
        }

        break;
      }
      case ActionTypes.DOCUMENT_DELETE__FAILURE:
        if (payload.document) {
          Document.upsert(payload.document);
        }

        break;
      case ActionTypes.DOCUMENT_DELETE__SUCCESS:
      case ActionTypes.DOCUMENT_DELETE_HANDLE: {
        const documentModel = Document.withId(payload.document.id);

        if (documentModel) {
          documentModel.delete();
        }

        break;
      }
      default:
    }
  }
}
