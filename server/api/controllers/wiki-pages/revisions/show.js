const Errors = {
  WIKI_PAGE_NOT_FOUND: {
    wikiPageNotFound: 'Wiki page not found',
  },
  REVISION_NOT_FOUND: {
    revisionNotFound: 'Revision not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    revisionId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    wikiPageNotFound: {
      responseType: 'notFound',
    },
    revisionNotFound: {
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

    const revision = await WikiPageRevision.findOne({ id: inputs.revisionId, wikiPageId: wikiPage.id });

    if (!revision) {
      throw Errors.REVISION_NOT_FOUND;
    }

    return {
      item: revision,
    };
  },
};
