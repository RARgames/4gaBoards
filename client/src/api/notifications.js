import omit from 'lodash/omit';

import socket from './socket';
import { transformActivity, transformCard, transformNotification, transformUser } from './transformers';

/* Actions */

const getNotifications = (headers) =>
  socket.get('/notifications', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
    included: {
      ...omit(body.included, 'actions'),
      cards: body.included.cards.map(transformCard),
      activities: body.included.actions.map(transformActivity),
      users: body.included.users.map(transformUser),
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

const markAllNotificationsAs = (data, headers) => socket.patch('/notifications', data, headers);

const deleteNotifications = (ids, headers) =>
  socket.delete(`/notifications/${ids.join(',')}`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformNotification),
  }));

const deleteAllNotifications = (data, headers) => socket.delete('/notifications', data, headers);

/* Event handlers */

const makeHandleNotificationCreate = (next) => (body) => {
  next({
    ...body,
    item: transformNotification(body.item),
  });
};

const makeHandleMarkAllNotificationsAs = (next) => (body) => {
  next({
    ...body,
    item: body.item.map(transformNotification),
  });
};

const makeHandleNotificationUpdate = makeHandleNotificationCreate;
const makeHandleNotificationDelete = makeHandleNotificationCreate;
const makeHandleDeleteAllNotifications = makeHandleMarkAllNotificationsAs;

export default {
  getNotifications,
  getNotification,
  updateNotifications,
  markAllNotificationsAs,
  deleteNotifications,
  deleteAllNotifications,
  makeHandleNotificationCreate,
  makeHandleNotificationUpdate,
  makeHandleMarkAllNotificationsAs,
  makeHandleNotificationDelete,
  makeHandleDeleteAllNotifications,
};
