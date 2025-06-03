const Errors = {
  BOARD_MEMBERSHIP_NOT_FOUND: {
    boardMembershipNotFound: 'Board membership not found',
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
    boardMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.boardMemberships.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_MEMBERSHIP_NOT_FOUND);

    let { boardMembership } = path;
    const { project } = path;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const isUserProjectManager = await sails.helpers.users.isProjectManager(boardMembership.userId, project.id);
    if (boardMembership.userId !== currentUser.id && !isProjectManager) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
    }
    if (isUserProjectManager) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
    }

    boardMembership = await sails.helpers.boardMemberships.deleteOne.with({
      project,
      record: boardMembership,
      currentUser,
      request: this.req,
    });

    if (!boardMembership) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND;
    }

    // Delete userProject if the user is not a member of any board in the project and is not a project manager
    const boardMemberships = await sails.helpers.boardMemberships.getMany({ userId: boardMembership.userId });
    const boardIds = boardMemberships.map((bm) => bm.boardId);
    const projects = await sails.helpers.boards.getMany({ id: boardIds });
    const projectIds = projects.map((p) => p.projectId);
    if (!projectIds.includes(project.id) && !isUserProjectManager) {
      const userProject = await sails.helpers.userProjects.getOne({ userId: boardMembership.userId, projectId: project.id });
      if (userProject) {
        await sails.helpers.userProjects.deleteOne.with({
          record: userProject,
          currentUser,
          request: this.req,
        });
      }
    }

    return {
      item: boardMembership,
    };
  },
};
