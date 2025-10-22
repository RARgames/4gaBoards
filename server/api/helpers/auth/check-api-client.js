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
      required: true,
      type: 'string',
    },
  },

  exits: {
    unauthorized: {},
  },

  async fn(inputs) {
    const client = await ApiClient.findOne({
      clientId: inputs.clientId,
      clientSecret: inputs.clientSecret,
    });

    if (!client) {
      throw 'unauthorized';
    }

    if (!client.permissions.includes(inputs.requiredPermission)) {
      throw 'unauthorized';
    }

    return client;
  },
};
