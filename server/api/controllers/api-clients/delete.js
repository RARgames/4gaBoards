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
      required: true,
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

    let apiClient = await ApiClient.findOne({ id: inputs.id });
    if (!apiClient) {
      throw Errors.API_CLIENT_NOT_FOUND;
    }

    if (apiClient.userId !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    apiClient = await sails.helpers.apiClients.deleteOne.with({
      record: apiClient,
      currentUser,
      request: this.req,
    });

    return {
      item: apiClient,
    };
  },
};
