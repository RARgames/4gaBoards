const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
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
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const { card } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const [currentMembership, mentionedMembership] = await Promise.all([
      BoardMembership.findOne({ boardId: card.boardId, userId: currentUser.id }),
      BoardMembership.findOne({ boardId: card.boardId, userId: inputs.userId }),
    ]);

    if (!currentMembership || !mentionedMembership) {
      throw Errors.CARD_NOT_FOUND;
    }

    if (currentMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const mentionedUser = await User.findOne({ id: inputs.userId });

    const action = await sails.helpers.actions.createOne.with({
      values: {
        card,
        scope: Action.Scopes.CARD,
        type: Action.Types.CARD_MENTION,
        data: {
          userId: inputs.userId,
          mentionedUserName: mentionedUser.name,
          description: card.description,
        },
      },
      currentUser,
      request: this.req,
    });

    return {
      item: action,
    };
  },
};
