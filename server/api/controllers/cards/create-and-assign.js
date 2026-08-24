// Creates a card from the Timesheet's ticket picker, for the case where the user logged time
// against work that has no card on the board yet. Distinct from cards/create in two ways, both of
// which exist because the caller is the Timesheet rather than a board view:
//   1. Position is computed server-side (append to the end of the list). The board UI derives the
//      position from its own ORM cache, but the Timesheet has no cards loaded for a board the user
//      hasn't opened, so it can't supply one.
//   2. The creating user is assigned to the card in the same request, so a partial failure can't
//      leave behind an unassigned card the user didn't ask for.

// Matches the spacing convention in helpers/utils/insert-to-positionables.js.
const POSITION_GAP = 2 ** 14;

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      required: true,
      isNotEmptyString: true,
      maxLength: 1024,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists.getProjectPath(inputs.listId).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: list.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const cards = await sails.helpers.lists.getCards(list.id);
    const position = cards.reduce((max, card) => Math.max(max, card.position), 0) + POSITION_GAP;

    const card = await sails.helpers.cards.createOne.with({
      values: {
        name: inputs.name.trim(),
        position,
        list,
        commentCount: 0,
      },
      currentUser,
      request: this.req,
    });

    // The board-membership check above already guarantees currentUser is a member, which is the
    // condition cardMemberships.createOne needs — so this can only realistically fail as a
    // duplicate, which is fine to swallow.
    await sails.helpers.cardMemberships.createOne
      .with({
        values: {
          card,
          userId: currentUser.id,
        },
        currentUser,
        request: this.req,
      })
      .tolerate('userAlreadyCardMember');

    // Shaped like the picker's card options (see controllers/cards/search.js) so the client can
    // link the new card to the time entry without a follow-up fetch.
    return {
      item: {
        id: card.id,
        name: card.name,
        boardId: board.id,
        boardName: board.name,
        projectId: project.id,
        projectName: project.name,
        listId: list.id,
        listName: list.name,
      },
    };
  },
};
