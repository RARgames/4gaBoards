const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
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
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyBoardMember: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    if (values.role === BoardMembership.Roles.EDITOR) {
      delete values.canComment;
    } else if (values.role === BoardMembership.Roles.VIEWER) {
      if (_.isNil(values.canComment)) {
        values.canComment = false;
      }
    }

    const boardMembership = await BoardMembership.create({
      ...values,
      boardId: values.board.id,
      userId: values.user.id,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyBoardMember')
      .fetch();

    if (boardMembership) {
      sails.sockets.broadcast(
        `user:${boardMembership.userId}`,
        'boardMembershipCreate',
        {
          item: boardMembership,
        },
        inputs.request,
      );

      sails.sockets.broadcast(
        `board:${boardMembership.boardId}`,
        'boardMembershipCreate',
        {
          item: boardMembership,
        },
        inputs.request,
      );

      await sails.helpers.actions.createOne.with({
        values: {
          board: values.board,
          scope: Action.Scopes.BOARD,
          type: Action.Types.BOARD_USER_ADD,
          data: {
            boardMembershipId: boardMembership.id,
            userId: boardMembership.userId,
            boardId: boardMembership.boardId,
            userName: values.user.name,
            role: boardMembership.role,
            canComment: boardMembership.canComment,
          },
        },
        currentUser,
        request: inputs.request,
      });

      await sails.helpers.boards.updateMeta.with({ id: boardMembership.boardId, currentUser, skipMetaUpdate });
    }

    return boardMembership;
  },
};
