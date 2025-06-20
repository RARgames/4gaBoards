const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const lists = await sails.helpers.boards.getLists(values.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, lists);

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await List.update({
        id,
        boardId: values.board.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.board.id}`, 'listUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const list = await List.create({
      ...values,
      position,
      boardId: values.board.id,
      createdById: currentUser.id,
    }).fetch();

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listCreate',
        {
          item: list,
        },
        inputs.request,
      );

      await sails.helpers.boards.updateMeta.with({ id: list.boardId, currentUser, skipMetaUpdate });
    }

    return list;
  },
};
