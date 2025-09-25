import omit from 'lodash/omit';

import socket from './socket';
import { transformActivity, transformCard, transformNotification } from './transformers';

/* Actions */

const getNotifications = (headers) =>
  socket.get('/notifications', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
    included: {
      ...omit(body.included, 'actions'),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const getNotification = (id, headers) =>
  socket.get(`/notifications/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformNotification(body.item),
    included: {
      ...omit(body.included, 'actions'),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
    },
  }));

const updateNotifications = (ids, data, headers) =>
  socket.patch(`/notifications/${ids.join(',')}`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
  }));

const deleteNotifications = (ids, headers) =>
  socket.delete(`/notifications/${ids.join(',')}`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
  }));

/* Event handlers */

const makeHandleNotificationCreate = (next) => (body) => {
  next({
    ...body,
    item: transformNotification(body.item),
  });
};

const makeHandleNotificationUpdate = makeHandleNotificationCreate;
const makeHandleNotificationDelete = makeHandleNotificationCreate;

export default {
  getNotifications,
  getNotification,
  updateNotifications,
  deleteNotifications,
  makeHandleNotificationCreate,
  makeHandleNotificationUpdate,
  makeHandleNotificationDelete,
};
