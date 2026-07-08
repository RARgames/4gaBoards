const Errors = {
  WIKI_PAGE_NOT_FOUND: {
    wikiPageNotFound: 'Wiki page not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    wikiPageNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const wikiPage = await sails.helpers.wikiPages.getOne(inputs.id);

    if (!wikiPage) {
      throw Errors.WIKI_PAGE_NOT_FOUND;
    }

    const { isAdmin, isManager, isMember } = await sails.helpers.projects.getMembershipContext.with({ projectId: wikiPage.projectId, currentUser });

    if (!isAdmin && !isManager && !isMember) {
      throw Errors.WIKI_PAGE_NOT_FOUND; // Forbidden
    }

    const revisions = await sails.helpers.wikiPages.getRevisions.with({ wikiPageId: wikiPage.id, limit: 20 });

    return {
      item: wikiPage,
      included: {
        revisions: revisions.map((revision) => _.omit(revision, ['content'])),
      },
    };
  },
};
