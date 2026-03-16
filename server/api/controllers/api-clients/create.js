module.exports = {
  inputs: {
    name: {
      type: 'string',
    },
    permissions: {
      type: 'json',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name', 'permissions']);

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
