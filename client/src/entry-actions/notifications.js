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

const deleteNotification = (id) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});

const handleNotificationUpdate = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_UPDATE_HANDLE,
  payload: {
    notification,
  },
});

const handleNotificationDelete = (notification) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE_HANDLE,
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
