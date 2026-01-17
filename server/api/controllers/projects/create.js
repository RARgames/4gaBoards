const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CORE_NOT_FOUND: {
    coreNotFound: 'coreNotFound',
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
    coreNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw Errors.CORE_NOT_FOUND;
    }
    if (!currentUser.isAdmin && !core.projectCreationAllEnabled) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name']);

    const { project, projectManager } = await sails.helpers.projects.createOne.with({
      values,
      currentUser,
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
