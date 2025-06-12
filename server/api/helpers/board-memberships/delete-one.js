const { v4: uuid } = require('uuid');

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

    const removedCardMemberships = await CardMembership.destroy({
      cardId: cardIds,
      userId: inputs.record.userId,
    }).fetch();

    const affectedCardIds = sails.helpers.utils.mapRecords(removedCardMemberships, 'cardId');
    const cards = await Card.find({ id: affectedCardIds });

    await Promise.all(
      cards.map(async (card) => {
        await sails.helpers.cards.updateMeta.with({ id: card.id, currentUser, skipMetaUpdate });
      }),
    );

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

      const isProjectManager = await sails.helpers.users.isProjectManager(inputs.record.userId, inputs.project.id);

      if (!isProjectManager) {
        sails.sockets.removeRoomMembersFromRooms(`@user:${boardMembership.userId}`, `board:${boardMembership.boardId}`, () => {
          notify(`board:${boardMembership.boardId}`);
        });
      }

      notify(`user:${boardMembership.userId}`);

      if (isProjectManager) {
        const tempRoom = uuid();

        sails.sockets.addRoomMembersToRooms(`board:${boardMembership.boardId}`, tempRoom, () => {
          sails.sockets.removeRoomMembersFromRooms(`user:${boardMembership.userId}`, tempRoom, () => {
            notify(tempRoom);
            sails.sockets.removeRoomMembersFromRooms(tempRoom, tempRoom);
          });
        });
      }

      let board = await Board.findOne(boardMembership.boardId);
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

      await sails.helpers.boards.updateMeta.with({ id: boardMembership.boardId, currentUser, skipMetaUpdate });
    }

    return boardMembership;
  },
};
