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
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    const taskMembership = await TaskMembership.destroyOne(inputs.record.id);

    if (taskMembership) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskMembershipDelete',
        {
          item: taskMembership,
        },
        inputs.request,
      );

      let task = await Task.findOne(taskMembership.taskId);
      if (task) {
        const { cardId } = task;

        const cardMembership = await CardMembership.findOne({
          cardId,
          userId: taskMembership.userId,
        });

        const tasks = await Task.find({ cardId });
        const taskIds = sails.helpers.utils.mapRecords(tasks);
        const taskMemberships = await sails.helpers.cards.getTaskMemberships(taskIds);
        const keepCardSubscription = taskMemberships.some((membership) => membership.userId === taskMembership.userId);

        if (!cardMembership && !keepCardSubscription) {
          const cardSubscription = await CardSubscription.destroyOne({
            cardId,
            userId: taskMembership.userId,
            isPermanent: false,
          });

          if (cardSubscription) {
            sails.sockets.broadcast(`user:${taskMembership.userId}`, 'cardUpdate', {
              item: {
                id: cardId,
                isSubscribed: false,
              },
            });
          }
        }
        task = await Task.updateOne(task.id).set({ updatedById: currentUser.id });
        if (task) {
          sails.sockets.broadcast(
            `board:${inputs.board.id}`,
            'taskUpdate',
            {
              item: {
                id: task.id,
                updatedAt: task.updatedAt,
                updatedById: task.updatedById,
              },
            },
            inputs.request,
          );
        }
      }
    }

    return taskMembership;
  },
};
