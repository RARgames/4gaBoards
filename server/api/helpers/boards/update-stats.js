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

    const cardStatsByBoard = await sails.helpers.boards.getCardStats(inputs.boardId);
    const cardStats = cardStatsByBoard[inputs.boardId];
    const taskStatsByBoard = await sails.helpers.boards.getTaskStats(inputs.boardId);
    const taskStats = taskStatsByBoard[inputs.boardId];

    const relatedUserIds = await sails.helpers.boards.getProjectManagerAndBoardMemberUserIds(board);

    relatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
        item: {
          id: inputs.boardId,
          cardTotal: cardStats.total,
          cardCompleted: cardStats.completed,
          taskTotal: taskStats.total,
          taskCompleted: taskStats.completed,
        },
      });
    });

    return undefined;
  },
};
