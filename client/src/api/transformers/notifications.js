import omit from 'lodash/omit';

// eslint-disable-next-line import-x/prefer-default-export
export const transformNotification = (notification) => ({
  ...omit(notification, 'actionId'),
  activityId: notification.actionId,
});
