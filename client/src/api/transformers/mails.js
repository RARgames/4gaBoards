// eslint-disable-next-line import/prefer-default-export
export const transformMail = (mail) => ({
  ...mail,
  ...(mail.createdAt && {
    createdAt: new Date(mail.createdAt),
  }),
  ...(mail.updatedAt && {
    updatedAt: new Date(mail.updatedAt),
  }),
});
