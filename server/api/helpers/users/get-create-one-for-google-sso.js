module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
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
    const email = inputs.email.toLowerCase();
    let user = await sails.helpers.users.getOne({ ssoGoogleId: inputs.id });
    // Default SSO login
    if (user) {
      return user;
    }
    user = await sails.helpers.users.getOne({ email });
    // First time SSO login
    if (user) {
      const updatedValues = {
        ssoGoogleId: inputs.id,
        ssoGoogleEmail: email,
      };
      user = await sails.helpers.users.updateOne.with({ values: updatedValues, record: user, currentUser: user });
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

    const newValues = {
      email,
      ssoGoogleId: inputs.id,
      ssoGoogleEmail: email,
      name: inputs.displayName || email.split('@')[0],
    };
    user = await sails.helpers.users.createOne.with({ values: newValues });

    if (user) {
      return user;
    }
    return null;
  },
};
