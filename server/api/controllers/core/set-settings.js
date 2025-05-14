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
    const coreItem = {
      ...core,
      ssoUrls: sails.config.custom.ssoUrls,
      ssoAvailable: sails.config.custom.ssoAvailable,
      demoMode: sails.config.custom.demoMode,
      projectCreationAll: sails.config.custom.projectCreationAll,
    };

    const users = await sails.helpers.users.getMany();
    const userIds = sails.helpers.utils.mapRecords(users);
    userIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'coreSettingsUpdate',
        {
          item: coreItem,
        },
        inputs.request,
      );
    });

    return {
      item: coreItem,
    };
  },
};
