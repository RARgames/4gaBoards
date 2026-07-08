const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PARENT_NOT_FOUND: {
    parentNotFound: 'Parent wiki page not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    title: {
      type: 'string',
      required: true,
    },
    content: {
      type: 'string',
    },
    parentId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    position: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    parentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const { isAdmin, isManager, membership } = await sails.helpers.projects.getMembershipContext.with({ projectId: project.id, currentUser });

    if (!isAdmin && !isManager && !(membership && membership.canEditWiki)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let parentId;
    if (inputs.parentId) {
      const parent = await sails.helpers.wikiPages.getOne(inputs.parentId);

      if (!parent || parent.projectId !== project.id) {
        throw Errors.PARENT_NOT_FOUND;
      }

      parentId = parent.id;
    }

    const values = { ..._.pick(inputs, ['title', 'content', 'position']), project, parentId };

    const wikiPage = await sails.helpers.wikiPages.createOne.with({
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: wikiPage,
    };
  },
};
