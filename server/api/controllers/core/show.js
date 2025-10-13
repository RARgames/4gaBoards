const Errors = {
  CORE_NOT_FOUND: {
    coreNotFound: 'Core not found',
  },
};

module.exports = {
  exits: {
    coreNotFound: {
      responseType: 'notFound',
    },
  },

  async fn() {
    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw Errors.CORE_NOT_FOUND;
    }

    return {
      item: {
        ssoRegistrationEnabled: core.ssoRegistrationEnabled,
        localRegistrationEnabled: core.localRegistrationEnabled,
        registrationEnabled: core.registrationEnabled,
        projectCreationAllEnabled: core.projectCreationAllEnabled,
        syncSsoDataOnAuth: core.syncSsoDataOnAuth,
        ssoUrls: sails.config.custom.ssoUrls,
        ssoAvailable: sails.config.custom.ssoAvailable,
        demoMode: sails.config.custom.demoMode,
      },
    };
  },
};
