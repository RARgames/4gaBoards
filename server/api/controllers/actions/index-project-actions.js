const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    beforeId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const isProjectMember = await sails.helpers.users.isProjectMember(currentUser.id, inputs.projectId);

    if (!isProjectMember) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const boards = await sails.helpers.projects.getBoards(inputs.projectId);
    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, inputs.projectId);

    let accessibleBoards = boards;
    let boardIds; // undefined - no board filter (project managers)

    if (!isProjectManager) {
      const boardMemberships = await sails.helpers.boardMemberships.getMany({
        boardId: sails.helpers.utils.mapRecords(boards),
        userId: currentUser.id,
      });

      if (boardMemberships.length === 0) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }

      boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
      accessibleBoards = boards.filter((board) => boardIds.includes(board.id));
    }

    const actions = await sails.helpers.projects.getActions(inputs.projectId, inputs.beforeId, boardIds);
    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);
    const sanitizedUsers = await sails.helpers.users.sanitize(users, currentUser);

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `project:${inputs.projectId}`);

      accessibleBoards.forEach((board) => {
        sails.sockets.join(this.req, `board:${board.id}`);
      });
    }

    return {
      items: actions,
      included: {
        users: sanitizedUsers,
      },
    };
  },
};
