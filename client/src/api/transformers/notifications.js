import omit from 'lodash/omit';

// eslint-disable-next-line import/prefer-default-export
export const transformNotification = (notification) => ({
  ...omit(notification, 'actionId'),
  activityId: notification.actionId,
});
