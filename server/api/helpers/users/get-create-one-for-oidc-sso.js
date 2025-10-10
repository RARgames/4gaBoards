/**
 * Get or create user for OIDC SSO authentication
 *
 * Handles three scenarios:
 * 1. Existing OIDC user - Updates username and admin status if changed
 * 2. Existing email user - Links OIDC account and syncs data
 * 3. New user - Creates account with OIDC credentials
 *
 * Admin status and username are synced from OIDC provider on each login
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
  },

  async fn(inputs) {
    const email = inputs.email.toLowerCase();
    let user = await sails.helpers.users.getOne({ ssoOidcId: inputs.id });
    // Default SSO login - update username and admin status on each login
    if (user) {
      const updatedValues = {
        ssoOidcId: inputs.id,
        ssoOidcEmail: email,
      };

      // Update username if provided and different
      if (inputs.username && inputs.username !== user.username) {
        updatedValues.username = inputs.username;
      }

      // Update admin status if provided (sync with OIDC provider on each login)
      if (typeof inputs.isAdmin === 'boolean' && inputs.isAdmin !== user.isAdmin) {
        updatedValues.isAdmin = inputs.isAdmin;
      }

      // Only update if there are changes
      if (Object.keys(updatedValues).length > 2) {
        // More than just ssoOidcId and ssoOidcEmail
        sails.log.info('OIDC: Updating existing user', { userId: user.id, updates: updatedValues });
        user = await sails.helpers.users.updateOne.with({ values: updatedValues, record: user, currentUser: user });
      }

      return user;
    }
    user = await sails.helpers.users.getOne({ email });
    // First time SSO login - link existing email account
    if (user) {
      const updatedValues = {
        ssoOidcId: inputs.id,
        ssoOidcEmail: email,
      };

      // Update username if provided and user doesn't have one
      if (inputs.username && !user.username) {
        updatedValues.username = inputs.username;
      }

      // Update admin status if provided (sync with OIDC provider)
      if (typeof inputs.isAdmin === 'boolean') {
        updatedValues.isAdmin = inputs.isAdmin;
      }

      sails.log.info('OIDC: Linking existing user account', { userId: user.id, updates: updatedValues });
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
      ssoOidcId: inputs.id,
      ssoOidcEmail: email,
      name: inputs.displayName || email.split('@')[0],
    };

    // Add username if provided and valid
    if (inputs.username) {
      newValues.username = inputs.username;
    }

    // Add admin status if provided
    if (typeof inputs.isAdmin === 'boolean') {
      newValues.isAdmin = inputs.isAdmin;
    }

    user = await sails.helpers.users.createOne.with({ values: newValues });

    if (user) {
      return user;
    }
    return null;
  },
};
