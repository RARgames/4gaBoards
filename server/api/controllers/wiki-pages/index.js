const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
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
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const { isAdmin, isManager, isMember } = await sails.helpers.projects.getMembershipContext.with({ projectId: project.id, currentUser });

    if (!isAdmin && !isManager && !isMember) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const wikiPages = await sails.helpers.wikiPages.getMany({ projectId: project.id });

    return {
      items: wikiPages.map((wikiPage) => _.omit(wikiPage, ['content'])),
    };
  },
};
