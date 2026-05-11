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
    const { currentUser } = this.req; // Might not be available at this time for some requests

    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw Errors.CORE_NOT_FOUND;
    }

    const allowedRegisterDomains = core.allowedRegisterDomains.join(';');

    return {
      item: {
        ssoRegistrationEnabled: core.ssoRegistrationEnabled,
        localRegistrationEnabled: core.localRegistrationEnabled,
        registrationEnabled: core.registrationEnabled,
        projectCreationAllEnabled: core.projectCreationAllEnabled,
        syncSsoDataOnAuth: core.syncSsoDataOnAuth,
        syncSsoAdminOnAuth: core.syncSsoAdminOnAuth,
        allowedRegisterDomains,
        ssoUrls: sails.config.custom.ssoUrls,
        ssoAvailable: sails.config.custom.ssoAvailable,
        oidcEnabledMethods: sails.config.custom.oidcEnabledMethods,
        demoMode: sails.config.custom.demoMode,
        mailServiceAvailable: sails.config.custom.mailServiceAvailable,
        mailServiceInboundEmail: sails.config.custom.mailServiceInboundEmail,
        hyperdxEnabled: sails.config.custom.hyperdxEnabled,
        hyperdxApiKey: sails.config.custom.hyperdxApiKey,
        hyperdxInstanceName: sails.config.custom.hyperdxInstanceName,
        hyperdxTracePropagationTargets: sails.config.custom.hyperdxTracePropagationTargets,
        otelUrl: sails.config.custom.otelUrl,
        otelUrlFormat: sails.config.custom.otelUrlFormat,
        createdAt: currentUser?.isAdmin ? core.createdAt : undefined,
        createdById: currentUser?.isAdmin ? core.createdById : undefined,
        updatedAt: currentUser?.isAdmin ? core.updatedAt : undefined,
        updatedById: currentUser?.isAdmin ? core.updatedById : undefined,
      },
    };
  },
};
