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
    const boardIds = _.isArray(inputs.idOrIds) ? inputs.idOrIds : [inputs.idOrIds];

    const stats = {};
    boardIds.forEach((id) => {
      stats[id] = { total: 0, completed: 0 };
    });

    const cards = await sails.helpers.boards.getCards(inputs.idOrIds);
    cards.forEach((card) => {
      const { boardId } = card;
      if (!stats[boardId]) {
        return;
      }

      stats[boardId].total += 1;
      if (card.isCompleted) {
        stats[boardId].completed += 1;
      }
    });

    return stats;
  },
};
