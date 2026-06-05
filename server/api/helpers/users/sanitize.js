const PUBLIC_USER_FIELDS = ['id', 'name', 'username', 'avatarUrl', 'deletedAt'];

const serializeUser = (user) => {
  if (!user) {
    return user;
  }
  return user.toJSON();
};

module.exports = {
  inputs: {
    users: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { users, currentUser } = inputs;
    const { isAdmin } = currentUser;

    if (Array.isArray(users)) {
      return users.map((user) => {
        const serializedUser = serializeUser(user);
        if (!serializedUser) {
          return serializedUser;
        }
        if (isAdmin || currentUser.id === serializedUser.id) {
          return serializedUser;
        }

        return _.pick(serializedUser, PUBLIC_USER_FIELDS);
      });
    }

    const serializedUser = serializeUser(users);
    if (!serializedUser) {
      return serializedUser;
    }
    if (isAdmin || currentUser.id === serializedUser.id) {
      return serializedUser;
    }

    return _.pick(serializedUser, PUBLIC_USER_FIELDS);
  },
};
