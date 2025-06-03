module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    const list = await List.archiveOne(inputs.record.id);

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listDelete',
        {
          item: list,
        },
        inputs.request,
      );

      let board = await Board.findOne(list.boardId);
      if (board) {
        board = await Board.updateOne(board.id).set({ updatedById: currentUser.id });
        if (board) {
          const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(board.projectId);
          const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(board.id);
          const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

          boardRelatedUserIds.forEach((userId) => {
            sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
              item: {
                id: board.id,
                updatedAt: board.updatedAt,
                updatedById: board.updatedById,
              },
            });
          });
        }
      }
    }

    return list;
  },
};
