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
    const boardSubscriptions = await sails.helpers.boards.getBoardSubscriptions(inputs.idOrIds, inputs.exceptUserIdOrIds);

    return sails.helpers.utils.mapRecords(boardSubscriptions, 'userId', _.isArray(inputs.idOrIds));
  },
};
