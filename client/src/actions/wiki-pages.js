import ActionTypes from '../constants/ActionTypes';

const fetchWikiPages = (projectId) => ({
  type: ActionTypes.WIKI_PAGES_FETCH,
  payload: {
    projectId,
  },
});

fetchWikiPages.success = (projectId, wikiPages) => ({
  type: ActionTypes.WIKI_PAGES_FETCH__SUCCESS,
  payload: {
    projectId,
    wikiPages,
  },
});

fetchWikiPages.failure = (projectId, error) => ({
  type: ActionTypes.WIKI_PAGES_FETCH__FAILURE,
  payload: {
    projectId,
    error,
  },
});

const fetchWikiPage = (id) => ({
  type: ActionTypes.WIKI_PAGE_FETCH,
  payload: {
    id,
  },
});

fetchWikiPage.success = (wikiPage, revisions) => ({
  type: ActionTypes.WIKI_PAGE_FETCH__SUCCESS,
  payload: {
    wikiPage,
    revisions,
  },
});

fetchWikiPage.failure = (id, error) => ({
  type: ActionTypes.WIKI_PAGE_FETCH__FAILURE,
  payload: {
    id,
    error,
  },
});

const createWikiPage = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_CREATE,
  payload: {
    wikiPage,
  },
});

createWikiPage.success = (localId, wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_CREATE__SUCCESS,
  payload: {
    localId,
    wikiPage,
  },
});

createWikiPage.failure = (localId, error) => ({
  type: ActionTypes.WIKI_PAGE_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleWikiPageCreate = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_CREATE_HANDLE,
  payload: {
    wikiPage,
  },
});

const updateWikiPage = (id, data) => ({
  type: ActionTypes.WIKI_PAGE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateWikiPage.success = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_UPDATE__SUCCESS,
  payload: {
    wikiPage,
  },
});

updateWikiPage.failure = (id, error) => ({
  type: ActionTypes.WIKI_PAGE_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleWikiPageUpdate = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_UPDATE_HANDLE,
  payload: {
    wikiPage,
  },
});

const deleteWikiPage = (id) => ({
  type: ActionTypes.WIKI_PAGE_DELETE,
  payload: {
    id,
  },
});

deleteWikiPage.success = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_DELETE__SUCCESS,
  payload: {
    wikiPage,
  },
});

deleteWikiPage.failure = (id, error, wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_DELETE__FAILURE,
  payload: {
    id,
    error,
    wikiPage,
  },
});

const handleWikiPageDelete = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_DELETE_HANDLE,
  payload: {
    wikiPage,
  },
});

const restoreWikiPageRevision = (id, revisionId) => ({
  type: ActionTypes.WIKI_PAGE_REVISION_RESTORE,
  payload: {
    id,
    revisionId,
  },
});

restoreWikiPageRevision.success = (wikiPage) => ({
  type: ActionTypes.WIKI_PAGE_REVISION_RESTORE__SUCCESS,
  payload: {
    wikiPage,
  },
});

restoreWikiPageRevision.failure = (id, error) => ({
  type: ActionTypes.WIKI_PAGE_REVISION_RESTORE__FAILURE,
  payload: {
    id,
    error,
  },
});

export default {
  fetchWikiPages,
  fetchWikiPage,
  createWikiPage,
  handleWikiPageCreate,
  updateWikiPage,
  handleWikiPageUpdate,
  deleteWikiPage,
  handleWikiPageDelete,
  restoreWikiPageRevision,
};
