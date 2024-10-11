module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const cardMembership = await CardMembership.destroyOne(inputs.record.id);

    if (cardMembership) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardMembershipDelete',
        {
          item: cardMembership,
        },
        inputs.request,
      );

      const tasks = await Task.find({ cardId: cardMembership.cardId });
      const taskIds = sails.helpers.utils.mapRecords(tasks);
      const taskMemberships = await sails.helpers.cards.getTaskMemberships(taskIds);
      const keepCardSubscription = taskMemberships.some((membership) => membership.userId === cardMembership.userId);

      if (!keepCardSubscription) {
        const cardSubscription = await CardSubscription.destroyOne({
          cardId: cardMembership.cardId,
          userId: cardMembership.userId,
          isPermanent: false,
        });

        if (cardSubscription) {
          sails.sockets.broadcast(`user:${cardMembership.userId}`, 'cardUpdate', {
            item: {
              id: cardMembership.cardId,
              isSubscribed: false,
            },
          });
        }
      }
    }

    return cardMembership;
  },
};
