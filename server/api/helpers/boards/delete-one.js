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
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, skipMetaUpdate } = inputs;

    const boardMemberships = await BoardMembership.destroy({
      boardId: inputs.record.id,
    }).fetch();
    // TODO should be also probably archived

    await Board.updateOne(inputs.record.id).set({ updatedById: currentUser.id });
    const board = await Board.archiveOne(inputs.record.id);

    if (board) {
      await Mail.destroy({ boardId: board.id });

      sails.sockets.removeRoomMembersFromRooms(`board:${board.id}`, `board:${board.id}`);

      const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(board.projectId);
      const boardMemberUserIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
      const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardDelete',
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
