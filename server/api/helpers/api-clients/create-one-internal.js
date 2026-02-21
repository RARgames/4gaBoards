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
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    apiClientAlreadyExists: {},
    coreNotFound: {},
  },

  async fn(inputs) {
    const { values, skipActions } = inputs;

    if (values.label && values.label === notificationsLabel) {
      const client = await ApiClient.findOne({ label: notificationsLabel });
      if (client) {
        throw 'apiClientAlreadyExists';
      }

      const apiClient = await ApiClient.create({
        clientId: crypto.randomBytes(16).toString('hex'),
        clientSecret: crypto.randomBytes(32).toString('hex'),
        permissions: ['notifications:createCard'],
        label: notificationsLabel,
        name: '1',
        createdById: '0',
      }).fetch();

      if (apiClient) {
        if (!skipActions) {
          await sails.helpers.actions.createOne.with({
            values: {
              scope: Action.Scopes.INSTANCE,
              type: Action.Types.API_KEY_CREATE,
              data: {
                apiClientId: apiClient.clientId,
                apiClientName: apiClient.name,
                apiClientLabel: apiClient.label,
              },
            },
            currentUser: { id: '0' },
            request: inputs.request,
          });
        }

        let core = await Core.findOne({ id: 0 });
        if (!core) {
          throw 'coreNotFound';
        }
        core = await Core.updateOne({ id: 0 }).set({ updatedById: '0' });
      }

      return apiClient;
    }

    return null;
  },
};
