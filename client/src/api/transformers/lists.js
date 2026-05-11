// eslint-disable-next-line import-x/prefer-default-export
export const transformList = (list) => ({
  ...list,
  ...(list.createdAt && {
    createdAt: new Date(list.createdAt),
  }),
  ...(list.updatedAt && {
    updatedAt: new Date(list.updatedAt),
  }),
});
