const Errors = {
  PROJECT_MEMBERSHIP_NOT_FOUND: {
    projectMembershipNotFound: 'Project membership not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
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
    projectMembershipNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let projectMembership = await sails.helpers.projectMemberships.getOne(inputs.id);

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    const project = await Project.findOne(projectMembership.projectId);

    if (!project) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    const isManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!currentUser.isAdmin && !isManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const isUserProjectManager = await sails.helpers.users.isProjectManager(projectMembership.userId, project.id);

    if (isUserProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS; // Managers keep project access; remove them via project-managers instead
    }

    // Cascade: removing project access also removes the user's access to every board in the project
    const boards = await sails.helpers.projects.getBoards(project.id);
    const boardIds = sails.helpers.utils.mapRecords(boards);
    const boardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
      userId: projectMembership.userId,
    });

    await Promise.all(
      boardMemberships.map((boardMembership) =>
        sails.helpers.boardMemberships.deleteOne.with({
          project,
          record: boardMembership,
          currentUser,
          request: this.req,
        }),
      ),
    );

    projectMembership = await sails.helpers.projectMemberships.deleteOne.with({
      record: projectMembership,
      currentUser,
      request: this.req,
    });

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: projectMembership,
    };
  },
};
