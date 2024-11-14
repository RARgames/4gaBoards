const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    language: {
      type: 'string',
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const result = await sails.helpers.projects.importGettingStarted(inputs.language, currentUser, this.req).intercept('projectNotFound', () => Errors.PROJECT_NOT_FOUND);

    return result;
  },
};
