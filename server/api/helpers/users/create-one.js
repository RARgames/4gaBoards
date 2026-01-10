const bcrypt = require('bcrypt');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isString(value.email)) {
    return false;
  }

  if (!_.isNil(value.password) && !_.isString(value.password)) {
    return false;
  }

  if (!_.isNil(value.username) && !_.isString(value.username)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    let hashedPassword;
    if (values.password) {
      hashedPassword = bcrypt.hashSync(values.password, 10);
    }

    if (values.username) {
      values.username = values.username.toLowerCase();
    }

    let user = await User.create({
      ...values,
      email: values.email.toLowerCase(),
      password: hashedPassword,
      isAdmin: sails.config.custom.demoMode,
      createdById: currentUser?.id ?? '0',
    })
      .intercept(
        {
          message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_email_unique"',
        },
        'emailAlreadyInUse',
      )
      .intercept(
        {
          message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_username_unique"',
        },
        'usernameAlreadyInUse',
      )
      .fetch();

    if (!currentUser) {
      user = await User.updateOne({ id: user.id }).set({ createdById: user.id, updatedAt: null });
    }

    await sails.helpers.userPrefs.createOne.with({ values: { id: user.id }, currentUser: user });

    // const userIds = await sails.helpers.users.getAdminIds();

    const users = await sails.helpers.users.getMany();
    const userIds = sails.helpers.utils.mapRecords(users);

    userIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'userCreate',
        {
          item: user,
        },
        inputs.request,
      );
    });

    if (user) {
      await sails.helpers.actions.createOne.with({
        values: {
          userAccount: user,
          scope: Action.Scopes.USER,
          type: currentUser ? Action.Types.USER_CREATE : Action.Types.USER_REGISTER,
          data: {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userUsername: user.username,
            userIsAdmin: user.isAdmin,
            userPhone: user.phone,
            userOrganization: user.organization,
            userAvatar: user.avatar,
            ssoGoogleEmail: user.ssoGoogleEmail,
            ssoGithubEmail: user.ssoGithubEmail,
            ssoGithubUsername: user.ssoGithubUsername,
            ssoMicrosoftEmail: user.ssoMicrosoftEmail,
            ssoOidcEmail: user.ssoOidcEmail,
          },
        },
        currentUser: currentUser || user,
        request: inputs.request,
      });
    }

    return user;
  },
};
