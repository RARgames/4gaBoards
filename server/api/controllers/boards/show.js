const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

      if (!isProjectManager) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }
    }

    const boardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);

    const userIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
    const users = await sails.helpers.users.getMany(userIds);

    const labels = await sails.helpers.boards.getLabels(board.id);
    const lists = await sails.helpers.boards.getLists(board.id);

    const autoArchiveDaysByListId = _.mapValues(_.keyBy(lists, 'id'), 'autoArchiveDays');

    // §5.3: cards past their list's auto-archive delay disappear from the normal board view —
    // no background job, just excluded lazily here. They remain visible via the Archive view
    // (boards/archived-cards controller), which applies the inverse of this same predicate.
    const cards = (await sails.helpers.boards.getCards(board.id)).filter((card) => !sails.helpers.cards.isArchived(card, autoArchiveDaysByListId[card.listId]));
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const cardSubscriptions = await sails.helpers.cardSubscriptions.getMany({
      cardId: cardIds,
      userId: currentUser.id,
    });

    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);
    const cardLabels = await sails.helpers.cards.getCardLabels(cardIds);
    const tasks = await sails.helpers.cards.getTasks(cardIds);
    const taskIds = sails.helpers.utils.mapRecords(tasks);
    const taskMemberships = await sails.helpers.cards.getTaskMemberships(taskIds);

    // Only cover attachments are sent with the board; the rest are fetched per-card when its modal opens
    const coverAttachmentIds = cards.flatMap((card) => (card.coverAttachmentId ? [card.coverAttachmentId] : []));
    const attachments = await sails.helpers.attachments.getMany({ id: coverAttachmentIds });

    // Cross-board card-to-card links: include any link with EITHER endpoint on this board.
    // This catches incoming links from other boards too (where `cardId` is on another board
    // but `linkedCardId` is on this one).
    const cardLinks = cardIds.length > 0 ? await sails.helpers.cardLinks.getMany({ or: [{ cardId: cardIds }, { linkedCardId: cardIds }] }) : [];

    // For any link endpoint that lives on a board OTHER than this one, denormalize the foreign
    // card's name + board id + board name onto the link payload. The client uses these fields
    // to render "Card name (Board name)" pills without needing the foreign Card record in its
    // redux-orm store.
    if (cardLinks.length > 0) {
      const localCardIdSet = new Set(cardIds);
      const externalCardIdSet = new Set();
      cardLinks.forEach((link) => {
        if (!localCardIdSet.has(link.cardId)) externalCardIdSet.add(link.cardId);
        if (!localCardIdSet.has(link.linkedCardId)) externalCardIdSet.add(link.linkedCardId);
      });

      if (externalCardIdSet.size > 0) {
        const externalCards = await sails.helpers.cards.getMany([...externalCardIdSet]);
        const externalCardById = _.keyBy(externalCards, 'id');
        const externalBoardIds = [...new Set(externalCards.map((c) => c.boardId))];
        const externalBoards = externalBoardIds.length > 0 ? await sails.helpers.boards.getMany(externalBoardIds) : [];
        const externalBoardById = _.keyBy(externalBoards, 'id');

        cardLinks.forEach((link) => {
          const linkedExt = externalCardById[link.linkedCardId];
          if (linkedExt) {
            link.linkedCardName = linkedExt.name;
            link.linkedCardBoardId = linkedExt.boardId;
            link.linkedCardBoardName = externalBoardById[linkedExt.boardId] ? externalBoardById[linkedExt.boardId].name : null;
          }
          const cardExt = externalCardById[link.cardId];
          if (cardExt) {
            link.cardName = cardExt.name;
            link.cardBoardId = cardExt.boardId;
            link.cardBoardName = externalBoardById[cardExt.boardId] ? externalBoardById[cardExt.boardId].name : null;
          }
        });
      }
    }

    const isSubscribedByCardId = cardSubscriptions.reduce(
      (result, cardSubscription) => ({
        ...result,
        [cardSubscription.cardId]: true,
      }),
      {},
    );

    cards.forEach((card) => {
      card.isSubscribed = isSubscribedByCardId[card.id] || false; // eslint-disable-line no-param-reassign
    });

    if (inputs.subscribe && this.req.isSocket) {
      sails.sockets.join(this.req, `board:${board.id}`);
    }

    return {
      item: board,
      included: {
        users,
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        tasks,
        taskMemberships,
        attachments,
        cardLinks,
        projects: [project],
      },
    };
  },
};
