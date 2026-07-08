const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  USER_ALREADY_PROJECT_MEMBER: {
    userAlreadyProjectMember: 'User already project member',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    canEditWiki: {
      type: 'boolean',
    },
    canManageDocuments: {
      type: 'boolean',
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    userAlreadyProjectMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!currentUser.isAdmin && !isManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const user = await sails.helpers.users.getOne(inputs.userId);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const values = _.pick(inputs, ['canEditWiki', 'canManageDocuments']);

    const projectMembership = await sails.helpers.projectMemberships.createOne
      .with({
        values: {
          ...values,
          project,
          user,
        },
        currentUser,
        request: this.req,
      })
      .intercept('userAlreadyProjectMember', () => Errors.USER_ALREADY_PROJECT_MEMBER);

    return {
      item: projectMembership,
    };
  },
};
