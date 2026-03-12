const crypto = require('crypto');

const notificationsLabel = 'internal:4gaBoardsNotifications';

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

    const updateValues = { updatedById: currentUser.id, ...values };
    if (regenerateSecret) {
      clientSecret = crypto.randomBytes(32).toString('hex');
      updateValues.clientSecret = clientSecret;
    }
    if (inputs.record.label === notificationsLabel) {
      updateValues.name = String(Number(inputs.record.name) + 1);
    }

    const apiClient = await ApiClient.updateOne(inputs.record.id).set(updateValues);

    if (apiClient) {
      sails.sockets.broadcast(
        `user:${apiClient.userId}`,
        'apiClientUpdate',
        {
          item: apiClient,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            userAccount: currentUser,
            scope: Action.Scopes.USER,
            type: Action.Types.API_CLIENT_UPDATE,
            data: {
              apiClientId: apiClient.id,
              apiClientName: apiClient.name,
              apiClientLabel: apiClient.label,
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
