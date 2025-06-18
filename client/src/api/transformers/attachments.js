// eslint-disable-next-line import/prefer-default-export
export const transformAttachment = (attachment) => ({
  ...attachment,
  ...(attachment.createdAt && {
    createdAt: new Date(attachment.createdAt),
  }),
  ...(attachment.updatedAt && {
    updatedAt: new Date(attachment.updatedAt),
  }),
});
