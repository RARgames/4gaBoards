const Errors = {
  USER_PROJECT_NOT_FOUND: {
    userProjectNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    userProjectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const userProject = await sails.helpers.userProjects.getOne({ userId: currentUser.id, projectId: inputs.projectId });

    if (!userProject) {
      throw Errors.USER_PROJECT_NOT_FOUND;
    }

    return {
      item: userProject,
    };
  },
};
