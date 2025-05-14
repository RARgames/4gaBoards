const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin && !sails.config.custom.projectCreationAll) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name']);

    const { project, projectManager } = await sails.helpers.projects.createOne.with({
      values,
      user: currentUser,
      request: this.req,
    });

    await sails.helpers.userProjects.createOne.with({
      values: {
        projectId: project.id,
        userId: currentUser.id,
      },
      request: this.req,
    });

    return {
      item: project,
      included: {
        projectManagers: [projectManager],
      },
    };
  },
};
