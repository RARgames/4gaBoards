const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    let boards = await sails.helpers.projects.getBoards(project.id);
    let boardIds = sails.helpers.utils.mapRecords(boards);

    const boardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
      userId: currentUser.id,
    });

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const projectMemberships = await sails.helpers.projectMemberships.getMany({ projectId: project.id });
    const projectMembership = projectMemberships.find((membership) => membership.userId === currentUser.id);

    if (!isProjectManager) {
      if (boardMemberships.length === 0 && !projectMembership) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }

      boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
      boards = boards.filter((board) => boardIds.includes(board.id));
    }

    const projectManagers = await sails.helpers.projects.getProjectManagers(project.id);

    const userIds = _.union(sails.helpers.utils.mapRecords(projectManagers, 'userId', true), sails.helpers.utils.mapRecords(projectMemberships, 'userId', true));
    const users = await sails.helpers.users.getMany(userIds);

    if (inputs.subscribe && this.req.isSocket) {
      sails.sockets.join(this.req, `project:${project.id}`);
    }

    return {
      item: project,
      included: {
        users,
        projectManagers,
        boards,
        boardMemberships,
        projectMemberships,
      },
    };
  },
};
