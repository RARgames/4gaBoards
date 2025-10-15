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
    domainNotAllowed: {},
  },

  async fn(inputs) {
    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw 'coreNotFound';
    }

    const email = inputs.email.toLowerCase();
    const name = inputs.displayName || email.split('@')[0];
    let user = await sails.helpers.users.getOne({ ssoGoogleId: inputs.id });
    // Default SSO login
    if (user) {
      if (core.syncSsoDataOnAuth) {
        const updatedValues = {};
        if (email !== user.ssoGoogleEmail) {
          updatedValues.ssoGoogleEmail = email;
        }
        if (user.name !== name) {
          updatedValues.name = name;
        }
        if (Object.keys(updatedValues).length > 0) {
          sails.log.info('Google SSO: Updating existing user account', { userId: user.id, values: updatedValues });
          user = await sails.helpers.users.updateOne.with({ values: updatedValues, record: user, currentUser: user });
        }
      }
      return user;
    }
    user = await sails.helpers.users.getOne({ email });
    // First time SSO login
    if (user) {
      const updatedValues = {
        ssoGoogleId: inputs.id,
        ssoGoogleEmail: email,
      };
      if (core.syncSsoDataOnAuth) {
        if (user.name !== name) {
          updatedValues.name = name;
        }
      }
      sails.log.info('Google SSO: Linking existing user account', { userId: user.id, values: updatedValues });
      user = await sails.helpers.users.updateOne.with({ values: updatedValues, record: user, currentUser: user });
      return user;
    }
    // Register new user

    if (!core.registrationEnabled) {
      throw 'registrationDisabled';
    }
    if (!core.ssoRegistrationEnabled) {
      throw 'ssoRegistrationDisabled';
    }
    if (core.allowedRegisterDomains.length > 0 && !core.allowedRegisterDomains.includes(email.split('@')[1])) {
      throw 'domainNotAllowed';
    }

    const newValues = {
      email,
      ssoGoogleId: inputs.id,
      ssoGoogleEmail: email,
      name,
    };
    user = await sails.helpers.users.createOne.with({ values: newValues });
    sails.log.info('Google SSO: Created new user account', user.id, user.name);

    if (user) {
      return user;
    }
    return null;
  },
};
