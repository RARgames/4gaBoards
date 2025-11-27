const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    beforeId: {
      type: 'string',
    },
    onlyComments: {
      type: 'boolean',
      defaultsTo: false,
    },
    exceptComments: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const criteria = {
      cardId: inputs.idOrIds,
    };

    if (inputs.onlyComments) {
      criteria.type = Action.Types.CARD_COMMENT;
    }
    if (inputs.exceptComments) {
      criteria.type = { '!=': Action.Types.CARD_COMMENT };
    }

    if (!_.isUndefined(inputs.beforeId)) {
      criteria.id = {
        '<': inputs.beforeId,
      };
    }

    return sails.helpers.actions.getMany(criteria, sails.config.custom.actionsLimit);
  },
};
