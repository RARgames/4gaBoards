import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* wikiPagesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.WIKI_PAGES_FETCH, ({ payload: { projectId } }) => services.fetchWikiPages(projectId)),
    takeEvery(EntryActionTypes.WIKI_PAGE_FETCH, ({ payload: { id } }) => services.fetchWikiPage(id)),
    takeEvery(EntryActionTypes.WIKI_PAGE_IN_PROJECT_CREATE, ({ payload: { projectId, data } }) => services.createWikiPageInProject(projectId, data)),
    takeEvery(EntryActionTypes.WIKI_PAGE_CREATE_HANDLE, ({ payload: { wikiPage } }) => services.handleWikiPageCreate(wikiPage)),
    takeEvery(EntryActionTypes.WIKI_PAGE_UPDATE, ({ payload: { id, data } }) => services.updateWikiPage(id, data)),
    takeEvery(EntryActionTypes.WIKI_PAGE_UPDATE_HANDLE, ({ payload: { wikiPage } }) => services.handleWikiPageUpdate(wikiPage)),
    takeEvery(EntryActionTypes.WIKI_PAGE_DELETE, ({ payload: { id, withChildren } }) => services.deleteWikiPage(id, withChildren)),
    takeEvery(EntryActionTypes.WIKI_PAGE_DELETE_HANDLE, ({ payload: { wikiPage } }) => services.handleWikiPageDelete(wikiPage)),
    takeEvery(EntryActionTypes.WIKI_PAGE_REVISION_RESTORE, ({ payload: { id, revisionId } }) => services.restoreWikiPageRevision(id, revisionId)),
  ]);
}
