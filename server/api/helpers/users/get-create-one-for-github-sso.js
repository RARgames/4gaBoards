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
    let user = await sails.helpers.users.getOne({ ssoGithubId: inputs.id });
    // Default SSO login
    if (user) {
      return user;
    }
    // Register new user
    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw 'coreNotFound';
    }
    if (!core.registrationEnabled) {
      throw 'registrationDisabled';
    }
    if (!core.ssoRegistrationEnabled) {
      throw 'ssoRegistrationDisabled';
    }

    const isUsernameTaken = await sails.helpers.users.getOne({ username: inputs.username.toLowerCase() });

    const newValues = {
      email: `${inputs.username}@github-sso-4ga-boards.com`,
      ssoGithubId: inputs.id,
      ssoGithubUsername: inputs.username,
      name: inputs.displayName || inputs.username,
      username: isUsernameTaken ? undefined : inputs.username.toLowerCase(),
    };
    user = await sails.helpers.users.createOne.with({ values: newValues });

    if (user) {
      return user;
    }
    return null;
  },
};
