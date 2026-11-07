import socket from './socket';
import { transformComment } from './transformers';

/* Comments */

const getCardComments = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/comments`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformComment),
  }));

const createComment = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/comments`, data, headers).then((body) => ({
    ...body,
    item: transformComment(body.item),
  }));

const createCommentMention = (cardId, userId, comment, headers) => socket.post(`/comments/${cardId}/mentions`, { userId, content: comment }, headers);

const updateComment = (id, data, headers) =>
  socket.patch(`/comments/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformComment(body.item),
  }));

const deleteComment = (id, headers) =>
  socket.delete(`/comments/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformComment(body.item),
  }));

/* Event handlers */

const makeHandleCommentCreate = (next) => (body) => {
  next({
    ...body,
    item: transformComment(body.item),
  });
};

const makeHandleCommentUpdate = makeHandleCommentCreate;
const makeHandleCommentDelete = makeHandleCommentCreate;

export default {
  getCardComments,
  createComment,
  createCommentMention,
  updateComment,
  deleteComment,
  makeHandleCommentCreate,
  makeHandleCommentUpdate,
  makeHandleCommentDelete,
};
