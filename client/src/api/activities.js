import socket from './socket';

/* Transformers */

export const transformActivity = (activity) => ({
  ...activity,
  createdAt: new Date(activity.createdAt),
  ...(activity.updatedAt && {
    updatedAt: new Date(activity.updatedAt),
  }),
});

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
