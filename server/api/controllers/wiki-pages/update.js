const Errors = {
  WIKI_PAGE_NOT_FOUND: {
    wikiPageNotFound: 'Wiki page not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PARENT_NOT_FOUND: {
    parentNotFound: 'Parent wiki page not found',
  },
  INVALID_PARENT: {
    invalidParent: 'A page cannot become a descendant of itself',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    title: {
      type: 'string',
    },
    content: {
      type: 'string',
      allowNull: true,
    },
    parentId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    position: {
      type: 'number',
    },
  },

  exits: {
    wikiPageNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    parentNotFound: {
      responseType: 'notFound',
    },
    invalidParent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let wikiPage = await sails.helpers.wikiPages.getOne(inputs.id);

    if (!wikiPage) {
      throw Errors.WIKI_PAGE_NOT_FOUND;
    }

    const { isAdmin, isManager, membership } = await sails.helpers.projects.getMembershipContext.with({ projectId: wikiPage.projectId, currentUser });

    if (!isAdmin && !isManager && !(membership && membership.canEditWiki)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.parentId) {
      const parent = await sails.helpers.wikiPages.getOne(inputs.parentId);

      if (!parent || parent.projectId !== wikiPage.projectId) {
        throw Errors.PARENT_NOT_FOUND;
      }

      if (parent.id === wikiPage.id) {
        throw Errors.INVALID_PARENT;
      }

      let ancestor = parent;
      while (ancestor.parentId) {
        if (ancestor.parentId === wikiPage.id) {
          throw Errors.INVALID_PARENT;
        }

        ancestor = await sails.helpers.wikiPages.getOne(ancestor.parentId); // eslint-disable-line no-await-in-loop
      }
    }

    const values = _.pick(inputs, ['title', 'content', 'parentId', 'position']);

    wikiPage = await sails.helpers.wikiPages.updateOne.with({
      record: wikiPage,
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: wikiPage,
    };
  },
};
