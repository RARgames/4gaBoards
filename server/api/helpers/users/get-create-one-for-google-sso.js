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
    // TODO start legacy way of authentication - to remove after some time
    user = await sails.helpers.users.getOne({ ssoGoogleEmail: email });
    if (user) {
      const updatedValues = {
        ssoGoogleId: inputs.id,
      };
      user = await sails.helpers.users.updateOne(user, updatedValues, {});
      return user;
    }
    // TODO end legacy way of authentication - to remove after some time
    user = await sails.helpers.users.getOne({ email });
    // First time SSO login
    if (user) {
      const updatedValues = {
        ssoGoogleId: inputs.id,
        ssoGoogleEmail: email,
      };
      user = await sails.helpers.users.updateOne(user, updatedValues, {}); // TODO: {} - needed for updateOne - fix it

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
    user = await sails.helpers.users.createOne(newValues);

    if (user) {
      return user;
    }
    return null;
  },
};
