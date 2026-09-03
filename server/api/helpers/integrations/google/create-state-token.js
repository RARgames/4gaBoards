const jwt = require('jsonwebtoken');

const EXPIRES_IN_SECONDS = 10 * 60;

// The OAuth handshake leaves the app and comes back as a plain browser redirect, with no
// Authorization header to identify the admin who started it. This signs who they are into the
// `state` parameter Google echoes back, short-lived so a leaked URL is not a standing grant.
// The callback still re-checks that the user is an admin - this only establishes who they are.
module.exports = {
  sync: true,

  inputs: {
    userId: {
      type: 'string',
      required: true,
    },
  },

  fn(inputs) {
    const iat = Math.floor(Date.now() / 1000);

    return jwt.sign({ iat, sub: { userId: inputs.userId, purpose: sails.config.custom.googleCalendar.statePurpose }, exp: iat + EXPIRES_IN_SECONDS }, sails.config.session.secret);
  },
};
