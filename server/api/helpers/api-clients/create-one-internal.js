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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const notificationsLabel = sails.config.custom.notificationsInternalApiClientLabel;

    if (values.label && values.label === notificationsLabel) {
      let version = 1;
      let client = await ApiClient.findOne({ label: notificationsLabel, deletedAt: null });
      if (client) {
        client = await ApiClient.destroyOne(client.id);
        version = Number(client.name) + 1;
      }

      const apiClient = await ApiClient.create({
        clientId,
        clientSecret,
        permissions: sails.config.custom.notificationsInternalApiClientPermissions,
        label: notificationsLabel,
        name: version.toString(),
      }).fetch();

      apiClient.clientSecret = clientSecret;
      return apiClient;
    }

    return null;
  },
};
