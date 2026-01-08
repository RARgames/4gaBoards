module.exports = {
  inputs: {
    beforeId: {
      type: 'string',
    },
  },

  async fn(inputs) {
    const criteria = {
      scope: Action.Scopes.INSTANCE,
    };

    if (!_.isUndefined(inputs.beforeId)) {
      criteria.id = {
        '<': inputs.beforeId,
      };
    }

    const actions = await sails.helpers.actions.getMany(criteria, sails.config.custom.actionsLimit);
    return actions.map((action) => ({
      ...action,
      coreId: 0,
    }));
  },
};
