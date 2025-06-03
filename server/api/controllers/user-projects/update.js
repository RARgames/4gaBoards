const Errors = {
  USER_PROJECT_NOT_FOUND: {
    userProjectNotFound: 'UserProject not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    isCollapsed: {
      type: 'boolean',
    },
  },

  exits: {
    userProjectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let userProject = await UserProject.findOne({
      projectId: inputs.projectId,
      userId: currentUser.id,
    });

    if (!userProject) {
      throw Errors.USER_PROJECT_NOT_FOUND;
    }

    const values = _.pick(inputs, ['isCollapsed']);

    userProject = await sails.helpers.userProjects.updateOne.with({
      values,
      record: userProject,
      currentUser,
      request: this.req,
    });

    if (!userProject) {
      throw Errors.USER_PROJECT_NOT_FOUND;
    }

    return {
      item: userProject,
    };
  },
};
