const Errors = {
  INVALID_PERMISSIONS: {
    invalidPermissions: 'Invalid permissions',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
    },
    permissions: {
      type: 'json',
    },
  },

  exits: {
    invalidPermissions: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name', 'permissions']);

    if (values.permissions === null || (Array.isArray(values.permissions) && values.permissions.length === 0)) {
      throw Errors.INVALID_PERMISSIONS;
    }

    const apiClient = await sails.helpers.apiClients.createOne.with({
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: {
        ...apiClient,
        clientSecret: apiClient.clientSecret,
      },
    };
  },
};
