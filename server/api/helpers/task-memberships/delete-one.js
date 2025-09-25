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
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, skipMetaUpdate } = inputs;

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

      const task = await Task.findOne(taskMembership.taskId);
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

        const card = await Card.findOne(task.cardId);
        const user = await User.findOne(taskMembership.userId);
        if (card && user) {
          await sails.helpers.actions.createOne.with({
            values: {
              card,
              scope: Action.Scopes.CARD,
              type: Action.Types.CARD_TASK_USER_REMOVE,
              data: {
                taskMembershipId: taskMembership.id,
                userId: taskMembership.userId,
                taskId: taskMembership.taskId,
                userName: user.name,
                taskName: task.name,
              },
            },
            currentUser,
          });
        }

        await sails.helpers.tasks.updateMeta.with({ id: task.id, currentUser, skipMetaUpdate });
      }
    }

    return taskMembership;
  },
};
