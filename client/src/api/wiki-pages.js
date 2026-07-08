import socket from './socket';

/* Actions */

const getWikiPages = (projectId, headers) => socket.get(`/projects/${projectId}/wiki-pages`, undefined, headers);

const createWikiPage = (projectId, data, headers) => socket.post(`/projects/${projectId}/wiki-pages`, data, headers);

const getWikiPage = (id, headers) => socket.get(`/wiki-pages/${id}`, undefined, headers);

const updateWikiPage = (id, data, headers) => socket.patch(`/wiki-pages/${id}`, data, headers);

const deleteWikiPage = (id, data, headers) => socket.delete(`/wiki-pages/${id}`, data, headers);

const getWikiPageRevision = (id, revisionId, headers) => socket.get(`/wiki-pages/${id}/revisions/${revisionId}`, undefined, headers);

const restoreWikiPageRevision = (id, revisionId, headers) => socket.post(`/wiki-pages/${id}/revisions/${revisionId}/restore`, undefined, headers);

export default {
  getWikiPages,
  createWikiPage,
  getWikiPage,
  updateWikiPage,
  deleteWikiPage,
  getWikiPageRevision,
  restoreWikiPageRevision,
};
