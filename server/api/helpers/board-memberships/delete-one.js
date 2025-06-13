module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
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

    const cardIds = await sails.helpers.boards.getCardIds(inputs.record.boardId);

    await CardSubscription.destroy({
      cardId: cardIds,
      userId: inputs.record.userId,
    });

    const boardMembership = await BoardMembership.destroyOne(inputs.record.id);

    if (boardMembership) {
      const notify = (room) => {
        sails.sockets.broadcast(
          room,
          'boardMembershipDelete',
          {
            item: boardMembership,
          },
          inputs.request,
        );
      };

      // This is just an extra check for legacy reasons - it is imposible to remove project manager from the board in his project
      const isProjectManager = await sails.helpers.users.isProjectManager(inputs.record.userId, inputs.project.id);
      if (!isProjectManager) {
        sails.sockets.removeRoomMembersFromRooms(`@user:${boardMembership.userId}`, `board:${boardMembership.boardId}`, () => {
          notify(`board:${boardMembership.boardId}`);
        });
      }

      notify(`user:${boardMembership.userId}`);

      await sails.helpers.boards.updateMeta.with({ id: boardMembership.boardId, currentUser, skipMetaUpdate });
    }

    return boardMembership;
  },
};
