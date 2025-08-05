const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
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
    const { values, currentUser, skipMetaUpdate } = inputs;

    if (!_.isUndefined(values.position)) {
      const tasks = await sails.helpers.cards.getTasks(inputs.record.cardId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, tasks);

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Task.update({
          id,
          cardId: inputs.record.cardId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'taskUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    const task = await Task.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (task) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskUpdate',
        {
          item: task,
        },
        inputs.request,
      );

      const card = await Card.findOne(inputs.record.cardId);
      if (card) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            type: values.position ? Action.Types.CARD_TASK_MOVE : Action.Types.CARD_TASK_UPDATE,
            data: {
              id: task.id,
              name: task.name,
              prevName: values.name && inputs.record.name,
              prevPosition: values.position && inputs.record.position,
              position: values.position && task.position,
              isCompleted: values.isCompleted && task.isCompleted,
              prevDueDate: values.dueDate !== undefined ? inputs.record.dueDate : undefined,
              dueDate: values.dueDate && task.dueDate,
            },
            user: currentUser,
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: task.cardId, currentUser, skipMetaUpdate });
    }

    return task;
  },
};
