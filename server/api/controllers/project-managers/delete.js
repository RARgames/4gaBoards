const Errors = {
  PROJECT_MANAGER_NOT_FOUND: {
    projectManagerNotFound: 'Project manager not found',
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
    projectManagerNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let projectManager = await ProjectManager.findOne(inputs.id);

    if (!projectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, projectManager.projectId);

    if (!isProjectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND; // Forbidden
    }

    // TODO: check if the last one
    projectManager = await sails.helpers.projectManagers.deleteOne.with({
      record: projectManager,
      request: this.req,
    });

    if (!projectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND;
    }

    // Delete userProject if the user is not a member of any board in the project
    const boardMemberships = await sails.helpers.boardMemberships.getMany({ userId: projectManager.userId });
    const boardIds = boardMemberships.map((boardMembership) => boardMembership.boardId);
    const projects = await sails.helpers.boards.getMany({ id: boardIds });
    const projectIds = projects.map((project) => project.projectId);
    if (!projectIds.includes(projectManager.projectId)) {
      const userProject = await sails.helpers.userProjects.getOne({ userId: projectManager.userId, projectId: projectManager.projectId });
      if (userProject) {
        await sails.helpers.userProjects.deleteOne.with({
          record: userProject,
          request: this.req,
        });
      }
    }

    return {
      item: projectManager,
    };
  },
};
