module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { values, currentUser, skipMetaUpdate } = inputs;

    const comment = await Comment.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (comment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'commentUpdate',
        {
          item: comment,
        },
        inputs.request,
      );

      const card = await Card.findOne(comment.cardId);
      const user = await User.findOne(comment.userId);
      if (card && user) {
        await sails.helpers.actions.createOne.with({
          values: {
            comment,
            card,
            scope: Action.Scopes.COMMENT,
            type: Action.Types.CARD_COMMENT_UPDATE,
            data: {
              commentId: comment.id,
              commentPrevText: inputs.record.data.text,
              commentText: comment.data.text,
              userId: comment.userId,
              userName: user.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: comment.cardId, currentUser, skipMetaUpdate });
    }

    return comment;
  },
};
