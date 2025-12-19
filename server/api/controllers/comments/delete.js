const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  COMMENT_NOT_FOUND: {
    commentNotFound: 'Comment not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    commentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.comments.getProjectPath({ id: inputs.id }).intercept('pathNotFound', () => Errors.COMMENT_NOT_FOUND);

    let { comment } = path;
    const { board, project } = path;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (comment.userId !== currentUser.id) {
        throw Errors.COMMENT_NOT_FOUND; // Forbidden
      }

      const boardMembership = await BoardMembership.findOne({
        boardId: board.id,
        userId: currentUser.id,
      });

      if (!boardMembership) {
        throw Errors.COMMENT_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR && !boardMembership.canComment) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    comment = await sails.helpers.comments.deleteOne.with({
      board,
      record: comment,
      currentUser,
      request: this.req,
    });

    if (!comment) {
      throw Errors.COMMENT_NOT_FOUND;
    }

    return {
      item: comment,
    };
  },
};
