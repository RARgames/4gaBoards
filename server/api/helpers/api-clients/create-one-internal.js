const crypto = require('crypto');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return true;
};

const notificationsLabel = 'internal:4gaBoardsNotifications';

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

  exits: {
    coreNotFound: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    if (values.label && values.label === notificationsLabel) {
      let version = 1;
      let client = await ApiClient.findOne({ label: notificationsLabel });
      if (client) {
        client = await ApiClient.destroyOne(client.id);
        version = Number(client.name) + 1;
      }

      const apiClient = await ApiClient.create({
        clientId,
        clientSecret,
        permissions: ['cards.create', 'tasks.create', 'attachments.create', 'card-labels.create', 'card-memberships.create'],
        label: notificationsLabel,
        name: version.toString(),
        createdById: '0',
      }).fetch();

      if (apiClient) {
        let core = await Core.findOne({ id: 0 });
        if (!core) {
          throw 'coreNotFound';
        }
        core = await Core.updateOne({ id: 0 }).set({ updatedById: '0' });
      }

      apiClient.clientSecret = clientSecret;
      return apiClient;
    }

    return null;
  },
};
