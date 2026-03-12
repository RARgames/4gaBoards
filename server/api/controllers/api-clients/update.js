const Errors = {
  API_CLIENT_NOT_FOUND: {
    apiClientNotFound: 'API client not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    permissions: {
      type: 'json',
    },
    regenerateSecret: {
      type: 'boolean',
    },
  },

  exits: {
    apiClientNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let apiClient = await ApiClient.findOne(inputs.id);

    if (!apiClient) {
      throw Errors.API_CLIENT_NOT_FOUND;
    }

    if (apiClient.userId !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'permissions']);

    apiClient = await sails.helpers.apiClients.updateOne.with({
      values,
      regenerateSecret: inputs.regenerateSecret,
      record: apiClient,
      currentUser,
      request: this.req,
    });

    if (!apiClient) {
      throw Errors.API_CLIENT_NOT_FOUND;
    }

    return {
      item: {
        ...apiClient,
        ...(inputs.regenerateSecret && { clientSecret: apiClient.clientSecret }),
      },
    };
  },
};
