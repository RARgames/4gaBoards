module.exports = {
  inputs: {
    record: {
      type: 'ref',
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
    const { currentUser, skipActions } = inputs;

    const apiClient = await ApiClient.destroyOne(inputs.record.id);

    if (apiClient) {
      sails.sockets.broadcast(
        `user:${inputs.record.userId}`,
        'apiClientDelete',
        {
          item: apiClient,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            scope: Action.Scopes.USER,
            type: Action.Types.API_CLIENT_DELETE,
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
