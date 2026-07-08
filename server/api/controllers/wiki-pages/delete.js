const Errors = {
  WIKI_PAGE_NOT_FOUND: {
    wikiPageNotFound: 'Wiki page not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    withChildren: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    wikiPageNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
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

    wikiPage = await sails.helpers.wikiPages.deleteOne.with({
      record: wikiPage,
      withChildren: inputs.withChildren,
      currentUser,
      request: this.req,
    });

    return {
      item: wikiPage,
    };
  },
};
