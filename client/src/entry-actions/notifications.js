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

const markAllNotificationsAsRead = () => ({
  type: EntryActionTypes.NOTIFICATION_MARK_ALL_AS_READ,
});

const handleMarkAllNotificationsAsRead = (notifications) => ({
  type: EntryActionTypes.NOTIFICATION_MARK_ALL_AS_READ_HANDLE,
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

const deleteAllNotifications = () => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_ALL,
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
  markAllNotificationsAsRead,
  handleMarkAllNotificationsAsRead,
  deleteNotification,
  handleNotificationDelete,
  deleteAllNotifications,
  handleDeleteAllNotifications,
};
