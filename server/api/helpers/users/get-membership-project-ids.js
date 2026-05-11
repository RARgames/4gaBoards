const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
  },

  async fn(inputs) {
    const projectMemberships = await sails.helpers.users.getProjectMemberships(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(projectMemberships, 'projectId', _.isArray(inputs.idOrIds));
  },
};
