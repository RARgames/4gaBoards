const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  LABEL_NOT_FOUND: {
    labelNotFound: 'Label not found',
  },
  LABEL_ALREADY_IN_CARD: {
    labelAlreadyInCard: 'Label already in card',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    labelNotFound: {
      responseType: 'notFound',
    },
    labelAlreadyInCard: {
      responseType: 'conflict',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { card } = await sails.helpers.cards.getProjectPath(inputs.cardId).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const currentUser = await User.findOne({ id: card.createdById });
    if (!currentUser) throw Errors.USER_NOT_FOUND;

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let label = await Label.findOne({
      name: inputs.name,
      boardId: card.boardId,
    });

    if (!label) {
      const { COLORS } = Label;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      label = await sails.helpers.labels.createOne.with({
        values: {
          name: inputs.name,
          color,
          board: { id: card.boardId },
        },
        currentUser,
        request: this.req,
      });
    }

    const cardLabel = await sails.helpers.cardLabels.createOne
      .with({
        values: {
          card,
          label,
        },
        currentUser,
        request: this.req,
      })
      .intercept('labelAlreadyInCard', () => Errors.LABEL_ALREADY_IN_CARD);

    return {
      item: cardLabel,
    };
  },
};
