const Errors = {
  WIKI_PAGE_NOT_FOUND: {
    wikiPageNotFound: 'Wiki page not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    revisionNotFound: {
      responseType: 'notFound',
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

    const revision = await WikiPageRevision.findOne({ id: inputs.revisionId, wikiPageId: wikiPage.id });

    if (!revision) {
      throw Errors.REVISION_NOT_FOUND;
    }

    wikiPage = await sails.helpers.wikiPages.restoreRevision.with({
      record: wikiPage,
      revision,
      currentUser,
      request: this.req,
    });

    return {
      item: wikiPage,
    };
  },
};
