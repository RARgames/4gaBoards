// New accounts may only come from OIDC sign-in: switched on by an admin, or enforced for the whole
// instance with OIDC_ONLY_REGISTRATION=true, in which case admins cannot switch it off

module.exports = {
  sync: true,

  inputs: {
    core: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    return !!inputs.core.oidcOnlyRegistration || sails.config.custom.oidcOnlyRegistrationEnforced;
  },
};
