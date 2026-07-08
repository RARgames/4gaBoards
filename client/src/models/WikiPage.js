import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'WikiPage';

  static fields = {
    id: attr(),
    title: attr(),
    slug: attr(),
    content: attr(),
    position: attr(),
    revisions: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'wikiPages',
    }),
    parentId: fk({
      to: 'WikiPage',
      as: 'parent',
      relatedName: 'children',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdWikiPages',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedWikiPages',
    }),
  };

  static reducer({ type, payload }, WikiPage) {
    switch (type) {
      case ActionTypes.WIKI_PAGES_FETCH__SUCCESS:
        payload.wikiPages.forEach((wikiPage) => {
          WikiPage.upsert(wikiPage);
        });

        break;
      case ActionTypes.WIKI_PAGE_FETCH__SUCCESS:
        WikiPage.upsert({ ...payload.wikiPage, revisions: payload.revisions });

        break;
      case ActionTypes.WIKI_PAGE_CREATE:
        WikiPage.upsert(payload.wikiPage);

        break;
      case ActionTypes.WIKI_PAGE_CREATE__SUCCESS:
        WikiPage.withId(payload.localId).delete();
        WikiPage.upsert(payload.wikiPage);

        break;
      case ActionTypes.WIKI_PAGE_CREATE__FAILURE: {
        const wikiPageModel = WikiPage.withId(payload.localId);

        if (wikiPageModel) {
          wikiPageModel.delete();
        }

        break;
      }
      case ActionTypes.WIKI_PAGE_CREATE_HANDLE:
        WikiPage.upsert(payload.wikiPage);

        break;
      case ActionTypes.WIKI_PAGE_UPDATE:
        WikiPage.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.WIKI_PAGE_UPDATE__SUCCESS:
      case ActionTypes.WIKI_PAGE_UPDATE_HANDLE:
      case ActionTypes.WIKI_PAGE_REVISION_RESTORE__SUCCESS: {
        const wikiPageModel = WikiPage.withId(payload.wikiPage.id);

        if (wikiPageModel) {
          wikiPageModel.update(payload.wikiPage);
        } else {
          WikiPage.upsert(payload.wikiPage);
        }

        break;
      }
      case ActionTypes.WIKI_PAGE_DELETE: {
        const wikiPageModel = WikiPage.withId(payload.id);

        if (wikiPageModel) {
          wikiPageModel.delete();
        }

        break;
      }
      case ActionTypes.WIKI_PAGE_DELETE__FAILURE:
        if (payload.wikiPage) {
          WikiPage.upsert(payload.wikiPage);
        }

        break;
      case ActionTypes.WIKI_PAGE_DELETE__SUCCESS:
      case ActionTypes.WIKI_PAGE_DELETE_HANDLE: {
        const wikiPageModel = WikiPage.withId(payload.wikiPage.id);

        if (wikiPageModel) {
          wikiPageModel.delete();
        }

        break;
      }
      default:
    }
  }
}
