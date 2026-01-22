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

    const actions = await sails.helpers.projects.getActions(inputs.projectId, inputs.beforeId);
    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `project:${inputs.projectId}`);

      const boards = await sails.helpers.projects.getBoards(inputs.projectId);
      boards.forEach((board) => {
        sails.sockets.join(this.req, `board:${board.id}`);
      });
    }

    return {
      items: actions,
      included: {
        users,
      },
    };
  },
};
