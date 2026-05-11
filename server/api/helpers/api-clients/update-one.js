const crypto = require('crypto');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    regenerateSecret: {
      type: 'boolean',
      defaultsTo: false,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, regenerateSecret, currentUser, skipActions } = inputs;
    let clientSecret;

    if (regenerateSecret) {
      clientSecret = crypto.randomBytes(32).toString('hex');
      values.clientSecret = clientSecret;
    }

    const apiClient = await ApiClient.updateOne(inputs.record.id).set(values);

    if (apiClient) {
      sails.sockets.broadcast(
        `user:${apiClient.userId}`,
        'apiClientUpdate',
        {
          item: apiClient,
        },
        inputs.request,
      );

      const valueKeys = Object.keys(values);
      const isOnlyLastUsedAt = valueKeys.length === 1 && Object.prototype.hasOwnProperty.call(values, 'last_used_at');
      if (!skipActions && !isOnlyLastUsedAt) {
        await sails.helpers.actions.createOne.with({
          values: {
            userAccount: currentUser,
            scope: Action.Scopes.USER,
            type: Action.Types.API_CLIENT_UPDATE,
            data: {
              apiClientId: apiClient.id,
              prevName: inputs.record.name,
              name: apiClient.name,
              prevPermissions: inputs.record.permissions,
              permissions: apiClient.permissions,
              regenerateSecret,
            },
          },
          currentUser,
          request: inputs.request,
        });
      }
    }

    apiClient.clientSecret = clientSecret;
    return apiClient;
  },
};
