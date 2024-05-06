module.exports = {
  fn() {
    return {
      item: {
        googleSsoUrl: sails.config.custom.googleSsoUrl,
        googleSsoEnabled: !!sails.config.custom.googleClientId,
      },
    };
  },
};
