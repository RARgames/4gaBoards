// eslint-disable-next-line import/prefer-default-export
export const transformCore = (core) => ({
  ...core,
  ...(core.createdAt && {
    createdAt: new Date(core.createdAt),
  }),
  ...(core.updatedAt && {
    updatedAt: new Date(core.updatedAt),
  }),
});
