module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
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

    const comment = await Comment.updateOne(inputs.record.id).set({ deletedAt: new Date(), deletedById: currentUser.id });

    if (comment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'commentDelete',
        {
          item: comment,
        },
        inputs.request,
      );

      const card = await Card.findOne(comment.cardId);
      if (card) {
        const commentCount = await sails.helpers.cards.getCommentCount.with({ idOrIds: card.id });

        await sails.helpers.cards.updateOne.with({
          record: card,
          values: {
            commentCount,
          },
          currentUser,
        });

        const user = await User.findOne(comment.userId);
        if (user) {
          await sails.helpers.actions.createOne.with({
            values: {
              comment,
              card,
              scope: Action.Scopes.COMMENT,
              type: Action.Types.CARD_COMMENT_DELETE,
              data: {
                commentId: comment.id,
                userId: comment.userId,
                commentText: comment.data.text,
                userName: user.name,
              },
            },
            currentUser,
          });
        }
      }

      await sails.helpers.cards.updateMeta.with({ id: comment.cardId, currentUser, skipMetaUpdate });
    }

    return comment;
  },
};
