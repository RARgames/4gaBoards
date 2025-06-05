const idValidator = (value) => _.isString(value);

module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: idValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { id, currentUser } = inputs;

    const board = await Board.updateOne(id).set({ updatedAt: new Date().toUTCString(), updatedById: currentUser.id });
    if (board) {
      const boardRelatedUserIds = await sails.helpers.boards.getProjectManagerAndBoardMemberUserIds(board);
      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
          item: {
            id: board.id,
            updatedAt: board.updatedAt,
            updatedById: board.updatedById,
          },
        });
      });

      await sails.helpers.projects.updateMeta.with({ id: board.projectId, currentUser });
    }

    return board;
  },
};
