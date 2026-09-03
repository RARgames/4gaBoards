const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

module.exports = {
  sync: true,

  inputs: {
    state: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notAvailable: {},
  },

  fn(inputs) {
    const config = sails.helpers.integrations.google.getConfig();

    if (!config.available) {
      throw 'notAvailable';
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state: inputs.state,
      // Offline access is what yields a refresh token, and Google only re-issues one when consent
      // is shown again - so an admin reconnecting an already-granted account still gets a usable
      // token rather than an access token that dies in an hour with no way to renew it.
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'false',
    });

    return `${AUTHORIZE_URL}?${params.toString()}`;
  },
};
