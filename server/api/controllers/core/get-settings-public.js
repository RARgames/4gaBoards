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
        googleSsoUrl: sails.config.custom.googleSsoUrl,
        googleSsoEnabled: !!sails.config.custom.googleClientId,
        githubSsoUrl: sails.config.custom.githubSsoUrl,
        githubSsoEnabled: !!sails.config.custom.githubClientId,
        demoMode: sails.config.custom.demoMode,
      },
    };
  },
};
