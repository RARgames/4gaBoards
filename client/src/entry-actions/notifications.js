import EntryActionTypes from '../constants/EntryActionTypes';

const handleNotificationCreate = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
  },
});

const updateNotification = (id, data) => ({
  type: EntryActionTypes.NOTIFICATION_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleNotificationUpdate = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_UPDATE_HANDLE,
  payload: {
    notification,
  },
});

const markAllNotificationsAs = (data) => ({
  type: EntryActionTypes.NOTIFICATION_MARK_ALL_AS,
  payload: {
    data,
  },
});

const handleMarkAllNotificationsAs = (notifications) => ({
  type: EntryActionTypes.NOTIFICATION_MARK_ALL_AS_HANDLE,
  payload: {
    notifications,
  },
});

const deleteNotification = (id) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});

const handleNotificationDelete = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});

const deleteAllNotifications = (data) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_ALL,
  payload: {
    data,
  },
});

const handleDeleteAllNotifications = (notifications) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_ALL_HANDLE,
  payload: {
    notifications,
  },
});

export default {
  handleNotificationCreate,
  updateNotification,
  handleNotificationUpdate,
  markAllNotificationsAs,
  handleMarkAllNotificationsAs,
  deleteNotification,
  handleNotificationDelete,
  deleteAllNotifications,
  handleDeleteAllNotifications,
};
