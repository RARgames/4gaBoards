module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const board = await Board.findOne(inputs.boardId);
    if (!board) {
      return undefined;
    }

    const statsByBoard = await sails.helpers.boards.getTaskStats(inputs.boardId);
    const stats = statsByBoard[inputs.boardId];

    const relatedUserIds = await sails.helpers.boards.getProjectManagerAndBoardMemberUserIds(board);

    relatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
        item: {
          id: inputs.boardId,
          taskTotal: stats.total,
          taskCompleted: stats.completed,
        },
      });
    });

    return undefined;
  },
};
