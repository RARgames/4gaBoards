import ActionTypes from '../constants/ActionTypes';

const handleNotificationCreate = (notification, users, cards, activities) => ({
  type: ActionTypes.NOTIFICATION_CREATE_HANDLE,
  payload: {
    notification,
    users,
    cards,
    activities,
  },
});

const updateNotification = (id, data) => ({
  type: ActionTypes.NOTIFICATION_UPDATE,
  payload: {
    id,
    data,
  },
});

updateNotification.success = (notification) => ({
  type: ActionTypes.NOTIFICATION_UPDATE__SUCCESS,
  payload: {
    notification,
  },
});

updateNotification.failure = (id, error) => ({
  type: ActionTypes.NOTIFICATION_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleNotificationUpdate = (notification) => ({
  type: ActionTypes.NOTIFICATION_UPDATE_HANDLE,
  payload: {
    notification,
  },
});

const markAllNotificationsAs = (data) => ({
  type: ActionTypes.NOTIFICATION_MARK_ALL_AS,
  payload: {
    data,
  },
});

markAllNotificationsAs.success = (notifications) => ({
  type: ActionTypes.NOTIFICATION_MARK_ALL_AS__SUCCESS,
  payload: {
    notifications,
  },
});

markAllNotificationsAs.failure = (error) => ({
  type: ActionTypes.NOTIFICATION_MARK_ALL_AS__FAILURE,
  payload: {
    error,
  },
});

const handleMarkAllNotificationsAs = (notifications) => ({
  type: ActionTypes.NOTIFICATION_MARK_ALL_AS_HANDLE,
  payload: {
    notifications,
  },
});

const deleteNotification = (id) => ({
  type: ActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});

deleteNotification.success = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE__SUCCESS,
  payload: {
    notification,
  },
});

deleteNotification.failure = (id, error) => ({
  type: ActionTypes.NOTIFICATION_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleNotificationDelete = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});

const deleteAllNotifications = (data) => ({
  type: ActionTypes.NOTIFICATION_DELETE_ALL,
  payload: {
    data,
  },
});

deleteAllNotifications.success = (notifications) => ({
  type: ActionTypes.NOTIFICATION_DELETE_ALL__SUCCESS,
  payload: {
    notifications,
  },
});

deleteAllNotifications.failure = (error) => ({
  type: ActionTypes.NOTIFICATION_DELETE_ALL__FAILURE,
  payload: {
    error,
  },
});

const handleDeleteAllNotifications = (notifications) => ({
  type: ActionTypes.NOTIFICATION_DELETE_ALL_HANDLE,
  payload: {
    notifications,
  },
});

export default {
  handleNotificationCreate,
  updateNotification,
  handleNotificationUpdate,
  deleteNotification,
  handleNotificationDelete,
  markAllNotificationsAs,
  handleMarkAllNotificationsAs,
  deleteAllNotifications,
  handleDeleteAllNotifications,
};
