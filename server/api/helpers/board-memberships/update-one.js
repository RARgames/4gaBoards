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
    const role = values.role || inputs.record.role;

    if (role === BoardMembership.Roles.EDITOR) {
      values.canComment = null;
    } else if (role === BoardMembership.Roles.VIEWER) {
      const canComment = _.isUndefined(values.canComment) ? inputs.record.canComment : values.canComment;

      if (_.isNull(canComment)) {
        values.canComment = false;
      }
    }

    const boardMembership = await BoardMembership.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (boardMembership) {
      sails.sockets.broadcast(
        `board:${boardMembership.boardId}`,
        'boardMembershipUpdate',
        {
          item: boardMembership,
        },
        inputs.request,
      );

      const board = await Board.findOne(boardMembership.boardId);
      const user = await User.findOne(boardMembership.userId);
      if (board && user) {
        await sails.helpers.actions.createOne.with({
          values: {
            board,
            scope: Action.Scopes.BOARD,
            type: Action.Types.BOARD_USER_UPDATE,
            data: {
              boardMembershipId: boardMembership.id,
              userId: boardMembership.userId,
              boardId: boardMembership.boardId,
              userName: user.name,
              prevRole: values.role !== undefined ? inputs.record.role : undefined,
              role: values.role && boardMembership.role,
              prevCanComment: values.canComment !== undefined ? inputs.record.canComment : undefined,
              canComment: values.canComment && boardMembership.canComment,
            },
          },
          currentUser,
          request: inputs.request,
        });
      }

      await sails.helpers.boards.updateMeta.with({ id: boardMembership.boardId, currentUser, skipMetaUpdate });
    }

    return boardMembership;
  },
};
