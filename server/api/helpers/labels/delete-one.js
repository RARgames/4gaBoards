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

    const removedCardLabels = await CardLabel.destroy({
      labelId: inputs.record.id,
    }).fetch();

    const affectedCardIds = sails.helpers.utils.mapRecords(removedCardLabels, 'cardId');
    const cards = await Card.find({ id: affectedCardIds });

    await Promise.all(
      cards.map(async (card) => {
        const updatedCard = await Card.updateOne({ id: card.id }).set({ updatedById: currentUser.id });
        if (updatedCard) {
          sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
            item: {
              id: updatedCard.id,
              updatedAt: updatedCard.updatedAt,
              updatedById: updatedCard.updatedById,
            },
          });
        }
      }),
    );

    const label = await Label.archiveOne(inputs.record.id);

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelDelete',
        {
          item: label,
        },
        inputs.request,
      );

      let board = await Board.findOne(label.boardId);
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

    return label;
  },
};
