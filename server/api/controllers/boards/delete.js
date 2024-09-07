const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
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
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let { board } = await sails.helpers.boards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, board.projectId);

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const boardMemberships = await sails.helpers.boardMemberships.getMany({ boardId: board.id });

    board = await sails.helpers.boards.deleteOne.with({
      record: board,
      request: this.req,
    });

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    // Delete userProject if the user is not a member of any board in the project and is not a project manager
    const userIds = boardMemberships.map((bm) => bm.userId);
    userIds.forEach(async (userId) => {
      const isUserProjectManager = await sails.helpers.users.isProjectManager(userId, board.projectId);
      if (isUserProjectManager) {
        return;
      }

      const userBoardMemberships = await sails.helpers.boardMemberships.getMany({ userId });
      const boardIds = userBoardMemberships.map((bm) => bm.boardId);
      const projects = await sails.helpers.boards.getMany({ id: boardIds });
      const projectIds = projects.map((p) => p.projectId);
      if (!projectIds.includes(board.projectId)) {
        const userProject = await sails.helpers.userProjects.getOne({ userId, projectId: board.projectId });

        await sails.helpers.userProjects.deleteOne.with({
          record: userProject,
          request: this.req,
        });
      }
    });

    return {
      item: board,
    };
  },
};
