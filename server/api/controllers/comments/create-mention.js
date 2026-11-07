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
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    content: {
      type: 'string',
      isNotEmptyString: true,
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
    const { card } = await sails.helpers.cards.getProjectPath(inputs.cardId).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const [currentMembership, mentionedMembership] = await Promise.all([
      BoardMembership.findOne({ boardId: card.boardId, userId: currentUser.id }),
      BoardMembership.findOne({ boardId: card.boardId, userId: inputs.userId }),
    ]);

    if (!currentMembership || !mentionedMembership) {
      throw Errors.CARD_NOT_FOUND;
    }

    const canMention = currentMembership.role === BoardMembership.Roles.EDITOR || currentMembership.canComment;
    if (!canMention) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const mentionedUser = await User.findOne({ id: inputs.userId });

    const action = await sails.helpers.actions.createOne.with({
      values: {
        card,
        scope: Action.Scopes.COMMENT,
        type: Action.Types.CARD_COMMENT_MENTION,
        data: {
          userId: inputs.userId,
          mentionedUserName: mentionedUser.name,
          comment: inputs.content,
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
