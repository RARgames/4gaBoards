const crypto = require('crypto');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
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
    const { values, currentUser, skipActions } = inputs;

    const apiClient = await ApiClient.create({
      ...values,
      clientId: crypto.randomBytes(16).toString('hex'),
      clientSecret: crypto.randomBytes(32).toString('hex'),
      userId: currentUser.id,
      createdById: currentUser.id,
    }).fetch();

    if (apiClient) {
      sails.sockets.broadcast(
        `user:${currentUser.id}`,
        'apiClientCreate',
        {
          item: apiClient,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            scope: Action.Scopes.USER,
            type: Action.Types.API_CLIENT_CREATE,
            data: {
              apiClientId: apiClient.clientId,
              apiClientName: apiClient.name,
              apiClientLabel: apiClient.label,
            },
          },
          currentUser,
          request: inputs.request,
        });
      }
    }

    return apiClient;
  },
};
