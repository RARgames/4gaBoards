import socket from './socket';
import { transformAttachment, transformDocument } from './transformers';

/* Actions */

// eslint-disable-next-line import/prefer-default-export
const getMedia = (projectId, headers) =>
  socket.get(`/projects/${projectId}/media`, undefined, headers).then((body) => ({
    ...body,
    documents: body.documents.map(transformDocument),
    attachments: body.attachments.map(transformAttachment),
  }));

export default {
  getMedia,
};
