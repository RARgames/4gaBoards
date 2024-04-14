module.exports = {
  fn() {
    return {
      item: {
        googleSsoUrl: {
          url: sails.config.custom.googleSsoUrl,
        },
      },
    };
  },
};
