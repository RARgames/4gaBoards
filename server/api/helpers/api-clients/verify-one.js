const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    clientId: {
      type: 'string',
      required: true,
    },
    clientSecret: {
      type: 'string',
      required: true,
    },
    requiredPermission: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    unauthorized: {},
  },

  async fn(inputs) {
    const { requiredPermission } = inputs;

    let apiClient = await ApiClient.findOne({ clientId: inputs.clientId, deletedAt: null });
    if (!apiClient) {
      throw 'unauthorized';
    }

    const match = await bcrypt.compare(inputs.clientSecret, apiClient.clientSecret);
    if (!match) {
      throw 'unauthorized';
    }

    const perms = apiClient.permissions || [];
    const allowed = perms.some((p) => {
      if (!p) return false;
      if (p === '*') return true;
      if (p === requiredPermission) return true;
      const [reqGroup] = requiredPermission.split('.');
      if (p.endsWith('.*')) {
        const [group] = p.split('.');
        if (group === reqGroup) return true;
      }

      return false;
    });

    if (!allowed) {
      throw 'unauthorized';
    }

    apiClient = await sails.helpers.apiClients.updateOne.with({
      values: { lastUsedAt: new Date().toUTCString() },
      record: apiClient,
      currentUser: { id: apiClient.userId }, // FIXME can be empty for notifications - we don't need this as only actions.createOne is using it
      request: this.req,
    });

    return apiClient;
  },
};
