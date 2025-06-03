// eslint-disable-next-line import/prefer-default-export
export const transformList = (list) => ({
  ...list,
  ...(list.createdAt && {
    createdAt: new Date(list.createdAt),
  }),
  ...(list.updatedAt && {
    updatedAt: new Date(list.updatedAt),
  }),
});
