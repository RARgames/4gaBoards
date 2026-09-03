const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

// Labels a connection with the Google account that granted it, so an admin looking at the list
// can tell whose calendars they are about to expose.
module.exports = {
  inputs: {
    accessToken: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    requestFailed: {},
  },

  async fn(inputs) {
    const response = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${inputs.accessToken}` } });

    if (!response.ok) {
      throw { requestFailed: `HTTP ${response.status}` };
    }

    const body = await response.json();

    return body.email;
  },
};
