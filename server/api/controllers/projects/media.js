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

    const boards = await sails.helpers.projects.getBoards(project.id);
    const boardIds = sails.helpers.utils.mapRecords(boards);

    let accessibleBoardIds = boardIds;
    if (!isAdmin && !isManager) {
      const boardMemberships = await sails.helpers.boardMemberships.getMany({
        boardId: boardIds,
        userId: currentUser.id,
      });

      accessibleBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
    }

    const [documents, cards] = await Promise.all([
      sails.helpers.documents.getMany.with({ projectId: project.id }),
      accessibleBoardIds.length > 0 ? sails.helpers.cards.getMany.with({ criteria: { boardId: accessibleBoardIds } }) : [],
    ]);

    const cardIds = sails.helpers.utils.mapRecords(cards);
    const attachments = cardIds.length > 0 ? await sails.helpers.attachments.getMany.with({ criteria: { cardId: cardIds } }) : [];

    const boardById = _.keyBy(boards, 'id');
    const cardById = _.keyBy(cards, 'id');

    const attachmentItems = attachments.map((rawAttachment) => {
      const attachment = rawAttachment.toJSON();
      const card = cardById[attachment.cardId];
      const board = card ? boardById[card.boardId] : undefined;

      return {
        ...attachment,
        cardId: card ? card.id : null,
        cardName: card ? card.name : null,
        boardId: board ? board.id : null,
        boardName: board ? board.name : null,
      };
    });

    return {
      documents,
      attachments: attachmentItems,
    };
  },
};
