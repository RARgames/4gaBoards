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
        registrationEnabled: core.registrationEnabled,
        googleSsoUrl: sails.config.custom.googleSsoUrl,
        googleSsoEnabled: !!sails.config.custom.googleClientId,
      },
    };
  },
};
