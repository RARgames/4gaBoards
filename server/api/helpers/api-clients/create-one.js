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

    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const apiClient = await ApiClient.create({
      ...values,
      clientId,
      clientSecret,
      userId: currentUser.id,
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
            userAccount: currentUser,
            scope: Action.Scopes.USER,
            type: Action.Types.API_CLIENT_CREATE,
            data: {
              apiClientId: apiClient.clientId,
              apiClientName: apiClient.name,
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
