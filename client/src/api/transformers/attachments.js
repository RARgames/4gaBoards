// eslint-disable-next-line import/prefer-default-export
export const transformAttachment = (attachment) => ({
  ...attachment,
  createdAt: new Date(attachment.createdAt),
});
