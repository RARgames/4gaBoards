import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* notificationsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.NOTIFICATION_CREATE_HANDLE, ({ payload: { notification } }) => services.handleNotificationCreate(notification)),
    takeEvery(EntryActionTypes.NOTIFICATION_UPDATE, ({ payload: { id, data } }) => services.updateNotification(id, data)),
    takeEvery(EntryActionTypes.NOTIFICATION_UPDATE_HANDLE, ({ payload: { notification } }) => services.handleNotificationUpdate(notification)),
    takeEvery(EntryActionTypes.NOTIFICATION_MARK_ALL_AS_READ, () => services.markAllNotificationsAsRead()),
    takeEvery(EntryActionTypes.NOTIFICATION_MARK_ALL_AS_READ_HANDLE, ({ payload: { notifications } }) => services.handleMarkAllNotificationsAsRead(notifications)),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE, ({ payload: { id } }) => services.deleteNotification(id)),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE_HANDLE, ({ payload: { notification } }) => services.handleNotificationDelete(notification)),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE_ALL, () => services.deleteAllNotifications()),
    takeEvery(EntryActionTypes.NOTIFICATION_DELETE_ALL_HANDLE, ({ payload: { notifications } }) => services.handleDeleteAllNotifications(notifications)),
  ]);
}
