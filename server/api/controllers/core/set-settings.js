const Errors = {
  CORE_NOT_FOUND: {
    coreNotFound: 'Core not found',
  },
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
};

module.exports = {
  inputs: {
    registrationEnabled: {
      type: 'boolean',
    },
    localRegistrationEnabled: {
      type: 'boolean',
    },
    ssoRegistrationEnabled: {
      type: 'boolean',
    },
  },

  exits: {
    coreNotFound: {
      responseType: 'notFound',
    },
    insufficientPermissions: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    if (sails.config.custom.demoMode) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    if (!currentUser.isAdmin) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    let core = await Core.findOne({ id: 0 });
    if (!core) {
      throw Errors.CORE_NOT_FOUND;
    }
    const values = _.pick(inputs, ['registrationEnabled', 'localRegistrationEnabled', 'ssoRegistrationEnabled']);

    core = await Core.updateOne({ id: 0 }).set({ ...values });

    const users = await sails.helpers.users.getMany();
    const userIds = sails.helpers.utils.mapRecords(users);
    userIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'coreSettingsUpdate',
        {
          item: core,
        },
        inputs.request,
      );
    });

    return {
      item: {
        ...core,
        googleSsoUrl: sails.config.custom.googleSsoUrl,
        googleSsoEnabled: !!sails.config.custom.googleClientId,
        githubSsoUrl: sails.config.custom.githubSsoUrl,
        githubSsoEnabled: !!sails.config.custom.githubClientId,
        microsoftSsoUrl: sails.config.custom.microsoftSsoUrl,
        microsoftSsoEnabled: !!sails.config.custom.microsoftClientId,
      },
    };
  },
};
