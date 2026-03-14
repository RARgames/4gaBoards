const Errors = {
  API_CLIENT_NOT_FOUND: {
    apiClientNotFound: 'API client not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  INVALID_PERMISSIONS: {
    invalidPermissions: 'Invalid permissions',
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
    invalidPermissions: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let apiClient = await ApiClient.findOne({ id: inputs.id, deletedAt: null });

    if (!apiClient) {
      throw Errors.API_CLIENT_NOT_FOUND;
    }

    if (apiClient.userId !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'permissions']);

    if (values.permissions === null || (Array.isArray(values.permissions) && values.permissions.length === 0)) {
      throw Errors.INVALID_PERMISSIONS;
    }

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
