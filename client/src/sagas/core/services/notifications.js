import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import request from '../request';

export function* handleNotificationCreate(notification) {
  const { cardId } = yield select(selectors.selectPath);
  const newNotification = notification;

  if (newNotification.cardId === cardId) {
    try {
      yield call(request, api.updateNotifications, [newNotification.id], {
        isRead: true,
      });
    } catch {} // eslint-disable-line no-empty

    newNotification.isRead = true;
  }
  let users;
  let cards;
  let activities;

  try {
    ({
      included: { users, cards, activities },
    } = yield call(request, api.getNotification, newNotification.id));
  } catch {
    return;
  }

  yield put(actions.handleNotificationCreate(newNotification, users, cards, activities));
}

export function* updateNotification(id, data) {
  yield put(actions.updateNotification(id, data));

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.updateNotifications, [id], data));
  } catch (error) {
    yield put(actions.updateNotification.failure(id, error));
    return;
  }

  yield put(actions.updateNotification.success(notifications[0]));
}

export function* handleNotificationUpdate(notification) {
  yield put(actions.handleNotificationUpdate(notification));
}

export function* markAllNotificationsAsRead() {
  yield put(actions.markAllNotificationsAsRead());

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.markAllNotificationsAsRead));
  } catch (error) {
    yield put(actions.markAllNotificationsAsRead.failure(error));
    return;
  }

  yield put(actions.markAllNotificationsAsRead.success(notifications));
}

export function* handleMarkAllNotificationsAsRead(notifications) {
  yield put(actions.handleMarkAllNotificationsAsRead(notifications));
}

export function* deleteNotification(id) {
  yield put(actions.deleteNotification(id));

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.deleteNotifications, [id]));
  } catch (error) {
    yield put(actions.deleteNotification.failure(id, error));
    return;
  }

  yield put(actions.deleteNotification.success(notifications[0]));
}

export function* handleNotificationDelete(notification) {
  yield put(actions.handleNotificationDelete(notification));
}

export function* deleteAllNotifications() {
  yield put(actions.deleteAllNotifications());

  let notifications;
  try {
    ({ items: notifications } = yield call(request, api.deleteAllNotifications));
  } catch (error) {
    yield put(actions.deleteAllNotifications.failure(error));
    return;
  }

  yield put(actions.deleteAllNotifications.success(notifications));
}

export function* handleDeleteAllNotifications(notifications) {
  yield put(actions.handleDeleteAllNotifications(notifications));
}

export default {
  handleNotificationCreate,
  updateNotification,
  handleNotificationUpdate,
  markAllNotificationsAsRead,
  handleMarkAllNotificationsAsRead,
  deleteNotification,
  handleNotificationDelete,
  deleteAllNotifications,
  handleDeleteAllNotifications,
};
