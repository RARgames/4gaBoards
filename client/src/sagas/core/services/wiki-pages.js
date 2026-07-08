import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';
import { goToPath } from './router';

export function* fetchWikiPages(projectId) {
  yield put(actions.fetchWikiPages(projectId));

  let wikiPages;
  try {
    ({ items: wikiPages } = yield call(request, api.getWikiPages, projectId));
  } catch (error) {
    yield put(actions.fetchWikiPages.failure(projectId, error));
    return;
  }

  yield put(actions.fetchWikiPages.success(projectId, wikiPages));
}

export function* fetchWikiPage(id) {
  yield put(actions.fetchWikiPage(id));

  let wikiPage;
  let revisions;
  try {
    ({
      item: wikiPage,
      included: { revisions },
    } = yield call(request, api.getWikiPage, id));
  } catch (error) {
    yield put(actions.fetchWikiPage.failure(id, error));
    return;
  }

  yield put(actions.fetchWikiPage.success(wikiPage, revisions));
}

export function* createWikiPageInProject(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createWikiPage({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let wikiPage;
  try {
    ({ item: wikiPage } = yield call(request, api.createWikiPage, projectId, data));
  } catch (error) {
    yield put(actions.createWikiPage.failure(localId, error));
    return;
  }

  yield put(actions.createWikiPage.success(localId, wikiPage));
  yield call(goToPath, `/projects/${projectId}/wiki/${wikiPage.slug}`);
}

export function* handleWikiPageCreate(wikiPage) {
  yield put(actions.handleWikiPageCreate(wikiPage));
}

export function* updateWikiPage(id, data) {
  const { projectId, wikiPageSlug } = yield select(selectors.selectPath);
  const wikiPageBeforeUpdate = yield select(selectors.selectWikiPageById, id);

  yield put(actions.updateWikiPage(id, data));

  let wikiPage;
  try {
    ({ item: wikiPage } = yield call(request, api.updateWikiPage, id, data));
  } catch (error) {
    yield put(actions.updateWikiPage.failure(id, error));
    return;
  }

  yield put(actions.updateWikiPage.success(wikiPage));

  if (wikiPageBeforeUpdate && wikiPageBeforeUpdate.slug === wikiPageSlug && wikiPage.slug !== wikiPageSlug) {
    yield call(goToPath, `/projects/${projectId}/wiki/${wikiPage.slug}`);
  }
}

export function* handleWikiPageUpdate(wikiPage) {
  yield put(actions.handleWikiPageUpdate(wikiPage));
}

export function* deleteWikiPage(id, withChildren) {
  const { projectId, wikiPageSlug } = yield select(selectors.selectPath);
  const wikiPageBeforeDelete = yield select(selectors.selectWikiPageById, id);

  yield put(actions.deleteWikiPage(id));

  let wikiPage;
  try {
    ({ item: wikiPage } = yield call(request, api.deleteWikiPage, id, { withChildren }));
  } catch (error) {
    yield put(actions.deleteWikiPage.failure(id, error, wikiPageBeforeDelete));
    return;
  }

  yield put(actions.deleteWikiPage.success(wikiPage));

  if (wikiPageBeforeDelete && wikiPageBeforeDelete.slug === wikiPageSlug) {
    yield call(goToPath, `/projects/${projectId}/wiki`);
  }
}

export function* handleWikiPageDelete(wikiPage) {
  yield put(actions.handleWikiPageDelete(wikiPage));
}

export function* restoreWikiPageRevision(id, revisionId) {
  const { projectId, wikiPageSlug } = yield select(selectors.selectPath);
  const wikiPageBeforeRestore = yield select(selectors.selectWikiPageById, id);

  yield put(actions.restoreWikiPageRevision(id, revisionId));

  let wikiPage;
  try {
    ({ item: wikiPage } = yield call(request, api.restoreWikiPageRevision, id, revisionId));
  } catch (error) {
    yield put(actions.restoreWikiPageRevision.failure(id, error));
    return;
  }

  yield put(actions.restoreWikiPageRevision.success(wikiPage));

  if (wikiPageBeforeRestore && wikiPageBeforeRestore.slug === wikiPageSlug && wikiPage.slug !== wikiPageSlug) {
    yield call(goToPath, `/projects/${projectId}/wiki/${wikiPage.slug}`);
  }
}

export default {
  fetchWikiPages,
  fetchWikiPage,
  createWikiPageInProject,
  handleWikiPageCreate,
  updateWikiPage,
  handleWikiPageUpdate,
  deleteWikiPage,
  handleWikiPageDelete,
  restoreWikiPageRevision,
};
