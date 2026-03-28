// eslint-disable-next-line import-x/prefer-default-export
export const transformCore = (core) => ({
  ...core,
  ...(core.createdAt && {
    createdAt: new Date(core.createdAt),
  }),
  ...(core.updatedAt && {
    updatedAt: new Date(core.updatedAt),
  }),
});
