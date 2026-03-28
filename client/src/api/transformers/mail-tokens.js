// eslint-disable-next-line import-x/prefer-default-export
export const transformMailToken = (mailToken) => ({
  ...mailToken,
  ...(mailToken.createdAt && {
    createdAt: new Date(mailToken.createdAt),
  }),
  ...(mailToken.updatedAt && {
    updatedAt: new Date(mailToken.updatedAt),
  }),
});
