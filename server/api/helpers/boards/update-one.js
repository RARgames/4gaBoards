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

    const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(inputs.record.projectId);

    const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.record.id);
    const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

    if (!_.isUndefined(values.position)) {
      const boards = await sails.helpers.projects.getBoards(inputs.record.projectId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, boards);

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Board.update({
          id,
          projectId: inputs.record.projectId,
        }).set({
          position: nextPosition,
        });

        boardRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
            item: {
              id,
              position: nextPosition,
            },
          });
        });
      });
    }

    const board = await Board.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (board) {
      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardUpdate',
          {
            item: board,
          },
          inputs.request,
        );
      });

      await sails.helpers.projects.updateMeta.with({ id: board.projectId, currentUser, skipMetaUpdate });
    }

    return board;
  },
};
