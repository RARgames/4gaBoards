const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptProjectMembershipIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      userId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptProjectMembershipIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptProjectMembershipIdOrIds,
      };
    }

    return sails.helpers.projectMemberships.getMany(criteria);
  },
};
