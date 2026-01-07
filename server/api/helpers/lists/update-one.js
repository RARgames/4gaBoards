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
      const lists = await sails.helpers.boards.getLists(inputs.record.boardId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, lists);

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await List.update({
          id,
          boardId: inputs.record.boardId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'listUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    const list = await List.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listUpdate',
        {
          item: list,
        },
        inputs.request,
      );

      await sails.helpers.actions.createOne.with({
        values: {
          list,
          scope: Action.Scopes.LIST,
          type: Action.Types.LIST_UPDATE,
          data: {
            listId: list.id,
            listPrevName: values.name && inputs.record.name,
            listName: list.name,
            listPrevIsCollapsed: values.isCollapsed !== undefined ? inputs.record.isCollapsed : undefined,
            listIsCollapsed: values.isCollapsed && list.isCollapsed,
            listPrevPosition: values.position ? inputs.record.position : undefined,
            listPosition: values.position && list.position,
          },
        },
        currentUser,
      });

      await sails.helpers.boards.updateMeta.with({ id: list.boardId, currentUser, skipMetaUpdate });
    }

    return list;
  },
};
