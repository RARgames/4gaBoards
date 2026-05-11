/**
 * Get or create user for OIDC SSO authentication
 *
 * Handles three scenarios:
 * 1. Existing user by oidcId - Default SSO login
 * 2. Existing user by oidcEmail - First time SSO Login (link account)
 * 3. Missing user - Register new user
 *
 * If syncSsoDataOnAuth is enabled, sync username and admin status from OIDC provider on each login
 */

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
    username: {
      type: 'string',
      allowNull: true,
    },
    isAdmin: {
      type: 'boolean',
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
    const isUsernameAvailable = inputs.username ? !(await sails.helpers.users.getOne({ username: inputs.username.toLowerCase() })) : false;
    let user = await sails.helpers.users.getOne({ ssoOidcId: inputs.id });
    // Default SSO login
    if (user) {
      if (core.syncSsoDataOnAuth) {
        const updatedValues = {};
        if (email !== user.ssoOidcEmail) {
          updatedValues.ssoOidcEmail = email;
        }
        if (isUsernameAvailable && inputs.username !== user.username) {
          updatedValues.username = inputs.username;
        }
        if (user.name !== name) {
          updatedValues.name = name;
        }
        if (core.syncSsoAdminOnAuth && typeof inputs.isAdmin === 'boolean' && inputs.isAdmin !== user.isAdmin) {
          updatedValues.isAdmin = inputs.isAdmin;
        }
        if (Object.keys(updatedValues).length > 0) {
          sails.log.info('OIDC SSO: Updating existing user account', { userId: user.id, values: updatedValues });
          user = await sails.helpers.users.updateOne.with({ values: updatedValues, record: user, currentUser: user });
        }
      }
      return user;
    }
    user = await sails.helpers.users.getOne({ email });
    // First time SSO login
    if (user) {
      const updatedValues = {
        ssoOidcId: inputs.id,
        ssoOidcEmail: email,
      };
      if (core.syncSsoDataOnAuth) {
        if (isUsernameAvailable && inputs.username !== user.username) {
          updatedValues.username = inputs.username;
        }
        if (user.name !== name) {
          updatedValues.name = name;
        }
        if (core.syncSsoAdminOnAuth && typeof inputs.isAdmin === 'boolean' && inputs.isAdmin !== user.isAdmin) {
          updatedValues.isAdmin = inputs.isAdmin;
        }
      }
      sails.log.info('OIDC SSO: Linking existing user account', { userId: user.id, values: updatedValues });
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
      ssoOidcId: inputs.id,
      ssoOidcEmail: email,
      name,
      username: isUsernameAvailable ? inputs.username?.toLowerCase() : undefined,
      isAdmin: core.syncSsoAdminOnAuth && typeof inputs.isAdmin === 'boolean' ? inputs.isAdmin : false,
    };
    user = await sails.helpers.users.createOne.with({ values: newValues });
    sails.log.info('OIDC SSO: Created new user account', user.id, user.name);

    if (user) {
      return user;
    }
    return null;
  },
};
