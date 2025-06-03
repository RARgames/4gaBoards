import socket from './socket';
import { transformActivity } from './transformers';

/* Actions */

const getActivities = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

/* Event handlers */

const makeHandleActivityCreate = (next) => (body) => {
  next({
    ...body,
    item: transformActivity(body.item),
  });
};

const makeHandleActivityUpdate = makeHandleActivityCreate;

const makeHandleActivityDelete = makeHandleActivityCreate;

export default {
  getActivities,
  makeHandleActivityCreate,
  makeHandleActivityUpdate,
  makeHandleActivityDelete,
};
