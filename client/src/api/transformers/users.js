export const transformUser = (user) => ({
  ...user,
  ...(user.createdAt && {
    createdAt: new Date(user.createdAt),
  }),
  ...(user.updatedAt && {
    updatedAt: new Date(user.updatedAt),
  }),
  ...(user.lastLogin && {
    lastLogin: new Date(user.lastLogin),
  }),
  ...(user.lastEmailVerificationRequestAt && {
    lastEmailVerificationRequestAt: new Date(user.lastEmailVerificationRequestAt),
  }),
});

export const transformUserData = (data) => ({
  ...data,
  ...(data.lastLogin && {
    lastLogin: data.lastLogin.toISOString(),
  }),
});
