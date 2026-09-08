const moment = require('moment');

// §5.4 / §6.4-6.6 of the board automation spec: returns cards matching the §5.3 "archived"
// predicate (sails.helpers.cards.isArchived) — the inverse of what boards/show.js excludes.
// No grouping/filtering params: the Archive view groups/filters this set client-side, same as
// the approved mockup's renderArchive().

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
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const board = await Board.findOne(inputs.id);
    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const boardMembership = await BoardMembership.findOne({ boardId: board.id, userId: currentUser.id });
    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden — hide existence, same as cards-summary
    }

    const lists = await sails.helpers.boards.getLists(board.id);
    const listById = _.keyBy(lists, 'id');

    const boardCards = await sails.helpers.boards.getCards(board.id);
    const cards = boardCards.filter((card) => sails.helpers.cards.isArchived(card, listById[card.listId]));
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const cardLabels = await sails.helpers.cards.getCardLabels(cardIds);
    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);

    const labelIds = _.uniq(cardLabels.map((cardLabel) => cardLabel.labelId));
    const labels = labelIds.length > 0 ? await Label.find(labelIds) : [];

    const memberUserIds = _.uniq(cardMemberships.map((cardMembership) => cardMembership.userId));
    const users = memberUserIds.length > 0 ? await sails.helpers.users.getMany(memberUserIds) : [];

    // Newest fully-archived month, for the Done list's archive-teaser row (§6.6). Falls back to
    // archivedAt for cards that were manually archived without ever having a completedAt stamp.
    let newestArchivedMonth = null;
    if (cards.length > 0) {
      const newestTimestamp = _.max(cards.map((card) => new Date(card.completedAt || card.archivedAt).getTime()));
      newestArchivedMonth = moment(newestTimestamp).format('MMM YYYY');
    }

    return {
      total: cards.length,
      newestArchivedMonth,
      items: cards,
      included: {
        lists,
        labels,
        cardLabels,
        cardMemberships,
        users,
      },
    };
  },
};
