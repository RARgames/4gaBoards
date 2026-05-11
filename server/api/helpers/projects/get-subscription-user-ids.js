const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptUserIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const projectSubscriptions = await sails.helpers.projects.getProjectSubscriptions(inputs.idOrIds, inputs.exceptUserIdOrIds);

    return sails.helpers.utils.mapRecords(projectSubscriptions, 'userId', _.isArray(inputs.idOrIds));
  },
};
