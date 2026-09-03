const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Both halves of the OAuth lifecycle - trading the initial code for tokens, and later refreshing
// an expired access token - are the same form POST to the same endpoint with a different grant,
// so they share one helper. Called directly rather than through passport: passport is wired here
// for *login* strategies, and this grant establishes access to a resource, not a session.
module.exports = {
  inputs: {
    params: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    notAvailable: {},
    requestFailed: {},
  },

  async fn(inputs) {
    const config = sails.helpers.integrations.google.getConfig();

    if (!config.available) {
      throw 'notAvailable';
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, ...inputs.params }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      sails.log.warn('Google Calendar: token request failed', response.status, body.error, body.error_description);
      throw { requestFailed: body.error_description || body.error || `HTTP ${response.status}` };
    }

    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      // Google reports a lifetime, not a deadline. Shave a minute off so a token that is about to
      // lapse is refreshed before use rather than failing a request mid-flight.
      expiresAt: body.expires_in ? new Date(Date.now() + (body.expires_in - 60) * 1000) : null,
    };
  },
};
