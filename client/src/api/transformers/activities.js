// eslint-disable-next-line import/prefer-default-export
export const transformActivity = (activity) => ({
  ...activity,
  ...(activity.createdAt && {
    createdAt: new Date(activity.createdAt),
  }),
  ...(activity.updatedAt && {
    updatedAt: new Date(activity.updatedAt),
  }),
});
