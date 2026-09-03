// Hands back a usable access token for a connection, refreshing it first when the stored one has
// lapsed. Every Google call goes through here rather than reading the stored token directly, so
// there is exactly one place that knows about expiry, refresh, and what to do when a grant has
// been revoked on Google's side.
//
// A failure here is recorded on the row and surfaced to the admin as a connection needing to be
// re-authorized: a revoked grant or a rotated SECRET_ENCRYPTION_KEY is a setup problem someone has
// to act on, not a transient error worth retrying.
module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    needsReauthorization: {},
  },

  async fn(inputs) {
    const { record } = inputs;

    if (record.accessToken && record.accessTokenExpiresAt && new Date(record.accessTokenExpiresAt) > new Date()) {
      try {
        return sails.helpers.utils.decryptSecret(record.accessToken);
      } catch {
        // Fall through to a refresh - a token we cannot read is no worse than an expired one.
      }
    }

    let refreshToken;
    try {
      refreshToken = sails.helpers.utils.decryptSecret(record.refreshToken);
    } catch {
      await sails.helpers.calendarConnections.markBroken(record, 'Stored credentials could not be read. Reconnect this account.');
      throw 'needsReauthorization';
    }

    let tokens;
    try {
      tokens = await sails.helpers.integrations.google.requestTokens({ grant_type: 'refresh_token', refresh_token: refreshToken });
    } catch (error) {
      await sails.helpers.calendarConnections.markBroken(record, error.requestFailed || 'Google rejected the stored credentials. Reconnect this account.');
      throw 'needsReauthorization';
    }

    await CalendarConnection.updateOne({ id: record.id }).set({
      accessToken: sails.helpers.utils.encryptSecret(tokens.accessToken),
      accessTokenExpiresAt: tokens.expiresAt,
      status: CalendarConnection.Statuses.ACTIVE,
      lastError: null,
    });

    return tokens.accessToken;
  },
};
