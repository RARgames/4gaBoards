module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
    },
    displayName: {
      type: 'string',
      allowNull: true,
    },
  },

  exits: {
    ssoRegistrationDisabled: {},
    registrationDisabled: {},
    coreNotFound: {},
  },

  async fn(inputs) {
    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw 'coreNotFound';
    }

    const name = inputs.displayName || inputs.username;
    const isUsernameAvailable = !(await sails.helpers.users.getOne({ username: inputs.username.toLowerCase() }));
    let user = await sails.helpers.users.getOne({ ssoGithubId: inputs.id });
    // Default SSO login
    if (user) {
      if (core.syncSsoDataOnAuth) {
        const updatedValues = {};
        if (inputs.username !== user.ssoGithubUsername) {
          updatedValues.ssoGithubUsername = inputs.username;
        }
        if (isUsernameAvailable && inputs.username !== user.username) {
          updatedValues.username = inputs.username;
        }
        if (user.name !== name) {
          updatedValues.name = name;
        }
        if (Object.keys(updatedValues).length > 0) {
          sails.log.info('GitHub SSO: Updating existing user account', { userId: user.id, values: updatedValues });
          user = await sails.helpers.users.updateOne.with({ values: updatedValues, record: user, currentUser: user });
        }
      }
      return user;
    }
    // Register new user
    if (!core.registrationEnabled) {
      throw 'registrationDisabled';
    }
    if (!core.ssoRegistrationEnabled) {
      throw 'ssoRegistrationDisabled';
    }

    const newValues = {
      email: `${inputs.username}@github-sso-4ga-boards.com`,
      ssoGithubId: inputs.id,
      ssoGithubUsername: inputs.username,
      name,
      username: isUsernameAvailable ? inputs.username.toLowerCase() : undefined,
    };
    user = await sails.helpers.users.createOne.with({ values: newValues });
    sails.log.info('GitHub SSO: Created new user account', user.id, user.name);

    if (user) {
      return user;
    }
    return null;
  },
};
