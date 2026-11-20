const Errors = {
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
  CORE_NOT_FOUND: { coreNotFound: 'coreNotFound' },
  PROJECT_NOT_FOUND: { projectNotFound: 'Project not found' },
  BOARD_CREATE_FAILED: { boardCreateFailed: 'Board create failed' },
};

module.exports = {
  inputs: {
    language: {
      type: 'string',
    },
  },

  exits: {
    notEnoughRights: { responseType: 'forbidden' },
    coreNotFound: { responseType: 'notFound' },
    projectNotFound: { responseType: 'notFound' },
    boardCreateFailed: { responseType: 'notFound' },
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

    const result = await sails.helpers.projects
      .importGettingStarted(inputs.language, currentUser, this.req)
      .intercept('projectNotFound', () => Errors.PROJECT_NOT_FOUND)
      .intercept('boardCreateFailed', () => Errors.BOARD_CREATE_FAILED);

    return result;
  },
};
