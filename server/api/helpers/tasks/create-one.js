const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
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
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;

    const tasks = await sails.helpers.cards.getTasks(values.card.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, tasks);

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Task.update({
        id,
        cardId: values.card.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.card.boardId}`, 'taskUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const task = await Task.create({
      ...values,
      position,
      cardId: values.card.id,
      createdById: currentUser.id,
    }).fetch();

    if (task) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'taskCreate',
        {
          item: task,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            card: values.card,
            scope: Action.Scopes.CARD,
            type: inputs.duplicate ? Action.Types.CARD_TASK_DUPLICATE : Action.Types.CARD_TASK_CREATE,
            data: {
              taskId: task.id,
              taskName: task.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: task.cardId, currentUser, skipMetaUpdate });
    }

    return task;
  },
};
