const Errors = {
  NOT_AVAILABLE: {
    notAvailable: 'Google Calendar integration is not configured',
  },
};

// Hands the admin a one-shot URL to start the Google consent flow. The redirect itself cannot
// carry the session, so identity travels in a signed, short-lived state parameter minted here.
module.exports = {
  exits: {
    notAvailable: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!sails.helpers.integrations.google.getConfig().available) {
      throw Errors.NOT_AVAILABLE;
    }

    const state = sails.helpers.integrations.google.createStateToken(currentUser.id);

    return {
      item: {
        url: sails.helpers.integrations.google.buildAuthorizeUrl(state),
      },
    };
  },
};
