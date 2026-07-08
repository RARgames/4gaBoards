// eslint-disable-next-line import/prefer-default-export
export const transformDocument = (document) => ({
  ...document,
  ...(document.createdAt && {
    createdAt: new Date(document.createdAt),
  }),
  ...(document.updatedAt && {
    updatedAt: new Date(document.updatedAt),
  }),
});
