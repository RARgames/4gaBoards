const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    boardNotFound: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;
    const actionUser = values.user || currentUser;

    const board = await Board.findOne(values.card.boardId);
    if (!board) {
      throw 'boardNotFound';
    }

    const comment = await Comment.create({
      ...values,
      cardId: values.card.id,
      userId: actionUser.id,
      createdById: currentUser.id,
    }).fetch();

    if (comment) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'commentCreate',
        {
          item: comment,
        },
        inputs.request,
      );

      if (!values.duplicate) {
        const commentCount = await sails.helpers.cards.getCommentCount(values.card.id);

        await sails.helpers.cards.updateOne.with({
          record: values.card,
          values: {
            commentCount,
          },
          currentUser,
        });
      }

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            comment,
            card: values.card,
            scope: Action.Scopes.COMMENT,
            type: Action.Types.CARD_COMMENT_CREATE,
            data: {
              commentId: comment.id,
              commentText: comment.data.text,
            },
          },
          currentUser,
          request: inputs.request,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: comment.cardId, currentUser, skipMetaUpdate });
    }

    return comment;
  },
};
