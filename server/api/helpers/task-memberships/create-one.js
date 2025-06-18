const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isString(value.userId)) {
    return false;
  }

  if (!_.isString(value.taskId)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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
    duplicate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyTaskMember: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const taskMembership = await TaskMembership.create({
      taskId: values.taskId,
      userId: values.userId,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyTaskMember')
      .fetch();

    if (taskMembership) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'taskMembershipCreate',
        {
          item: taskMembership,
        },
        inputs.request,
      );

      const existingSubscription = await CardSubscription.findOne({
        cardId: values.card.id,
        userId: values.userId,
      });

      if (!existingSubscription) {
        const cardSubscription = await CardSubscription.create({
          cardId: values.card.id,
          userId: values.userId,
          isPermanent: false,
        })
          .tolerate('E_UNIQUE')
          .fetch();

        if (cardSubscription) {
          sails.sockets.broadcast(
            `user:${values.userId}`,
            'cardUpdate',
            {
              item: {
                id: values.card.id,
                isSubscribed: true,
              },
            },
            inputs.duplicate ? undefined : inputs.request,
          );
        }
      }

      await sails.helpers.tasks.updateMeta.with({ id: taskMembership.taskId, currentUser, skipMetaUpdate });
    }

    return taskMembership;
  },
};
