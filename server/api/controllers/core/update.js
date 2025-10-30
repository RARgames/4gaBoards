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
    projectCreationAllEnabled: {
      type: 'boolean',
    },
    syncSsoDataOnAuth: {
      type: 'boolean',
    },
    syncSsoAdminOnAuth: {
      type: 'boolean',
    },
    allowedRegisterDomains: {
      type: 'json',
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
    const values = _.pick(inputs, ['registrationEnabled', 'localRegistrationEnabled', 'ssoRegistrationEnabled', 'projectCreationAllEnabled', 'syncSsoDataOnAuth', 'syncSsoAdminOnAuth']);

    const allowedRegisterDomains = _.uniq(inputs.allowedRegisterDomains?.map((d) => d.trim().toLowerCase()).filter(Boolean));

    core = await Core.updateOne({ id: 0 }).set({ updatedById: currentUser.id, ...values, allowedRegisterDomains });
    const coreItem = {
      ...core,
      allowedRegisterDomains: core.allowedRegisterDomains.join(';'),
      ssoUrls: sails.config.custom.ssoUrls,
      ssoAvailable: sails.config.custom.ssoAvailable,
      oidcEnabledMethods: sails.config.custom.oidcEnabledMethods,
      demoMode: sails.config.custom.demoMode,
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
        this.req,
      );
    });

    return {
      item: coreItem,
    };
  },
};
