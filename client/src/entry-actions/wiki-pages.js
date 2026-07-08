import EntryActionTypes from '../constants/EntryActionTypes';

const fetchWikiPages = (projectId) => ({
  type: EntryActionTypes.WIKI_PAGES_FETCH,
  payload: {
    projectId,
  },
});

const fetchWikiPage = (id) => ({
  type: EntryActionTypes.WIKI_PAGE_FETCH,
  payload: {
    id,
  },
});

const createWikiPageInProject = (projectId, data) => ({
  type: EntryActionTypes.WIKI_PAGE_IN_PROJECT_CREATE,
  payload: {
    projectId,
    data,
  },
});

const handleWikiPageCreate = (wikiPage) => ({
  type: EntryActionTypes.WIKI_PAGE_CREATE_HANDLE,
  payload: {
    wikiPage,
  },
});

const updateWikiPage = (id, data) => ({
  type: EntryActionTypes.WIKI_PAGE_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleWikiPageUpdate = (wikiPage) => ({
  type: EntryActionTypes.WIKI_PAGE_UPDATE_HANDLE,
  payload: {
    wikiPage,
  },
});

const deleteWikiPage = (id, withChildren) => ({
  type: EntryActionTypes.WIKI_PAGE_DELETE,
  payload: {
    id,
    withChildren,
  },
});

const handleWikiPageDelete = (wikiPage) => ({
  type: EntryActionTypes.WIKI_PAGE_DELETE_HANDLE,
  payload: {
    wikiPage,
  },
});

const restoreWikiPageRevision = (id, revisionId) => ({
  type: EntryActionTypes.WIKI_PAGE_REVISION_RESTORE,
  payload: {
    id,
    revisionId,
  },
});

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
