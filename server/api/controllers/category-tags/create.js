const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  INVALID_NAME: {
    invalidName: 'A category with this name already exists',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    invalidName: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const categoryTag = await sails.helpers.categoryTags.createOne
      .with({
        values: {
          name: inputs.name,
          projectId: project.id,
        },
        currentUser,
      })
      .intercept('invalidName', () => Errors.INVALID_NAME);

    return {
      item: categoryTag,
    };
  },
};
