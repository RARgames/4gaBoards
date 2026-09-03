// Stores (or re-stores) a connection for one Google account. Keyed on the account email rather
// than on an id the admin picks, so re-authorizing an account already connected updates that row
// instead of leaving two connections racing to represent the same calendars.
module.exports = {
  inputs: {
    provider: {
      type: 'string',
      required: true,
    },
    accountEmail: {
      type: 'string',
      required: true,
    },
    refreshToken: {
      type: 'string',
      required: true,
    },
    accessToken: {
      type: 'string',
    },
    accessTokenExpiresAt: {
      type: 'ref',
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const values = {
      refreshToken: sails.helpers.utils.encryptSecret(inputs.refreshToken),
      accessToken: inputs.accessToken ? sails.helpers.utils.encryptSecret(inputs.accessToken) : null,
      accessTokenExpiresAt: inputs.accessTokenExpiresAt || null,
      status: CalendarConnection.Statuses.ACTIVE,
      lastError: null,
      updatedById: inputs.currentUser.id,
    };

    const existing = await CalendarConnection.findOne({ provider: inputs.provider, accountEmail: inputs.accountEmail });

    if (existing) {
      return CalendarConnection.updateOne({ id: existing.id }).set(values);
    }

    return CalendarConnection.create({
      provider: inputs.provider,
      accountEmail: inputs.accountEmail,
      createdById: inputs.currentUser.id,
      ...values,
    }).fetch();
  },
};
