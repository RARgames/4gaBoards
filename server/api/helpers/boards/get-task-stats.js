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
    if (cards.length === 0) {
      return stats;
    }

    const cardIdToBoardId = {};
    cards.forEach((card) => {
      cardIdToBoardId[card.id] = card.boardId;
    });

    const cardIds = sails.helpers.utils.mapRecords(cards);
    const tasks = await sails.helpers.cards.getTasks(cardIds);
    tasks.forEach((task) => {
      const boardId = cardIdToBoardId[task.cardId];
      if (!boardId) {
        return;
      }

      stats[boardId].total += 1;
      if (task.isCompleted) {
        stats[boardId].completed += 1;
      }
    });

    return stats;
  },
};
