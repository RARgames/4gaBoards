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

const handleNotificationUpdate = (notification) => ({
  type: ActionTypes.NOTIFICATION_UPDATE_HANDLE,
  payload: {
    notification,
  },
});

const handleNotificationDelete = (notification) => ({
  type: ActionTypes.NOTIFICATION_DELETE_HANDLE,
  payload: {
    notification,
  },
});

export default {
  handleNotificationCreate,
  updateNotification,
  deleteNotification,
  handleNotificationUpdate,
  handleNotificationDelete,
};
