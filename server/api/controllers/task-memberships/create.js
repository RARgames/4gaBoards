const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_TASK_MEMBER: {
    userAlreadyTaskMember: 'User already task member',
  },
};

module.exports = {
  inputs: {
    taskId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
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
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyTaskMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards.getProjectPath(inputs.cardId).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

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

    const isBoardMember = await sails.helpers.users.isBoardMember(inputs.userId, card.boardId);

    if (!isBoardMember) {
      throw Errors.USER_NOT_FOUND;
    }

    const taskMembership = await sails.helpers.taskMemberships.createOne
      .with({
        values: {
          card,
          taskId: inputs.taskId,
          userId: inputs.userId,
        },
        request: this.req,
      })
      .intercept('userAlreadyTaskMember', () => Errors.USER_ALREADY_TASK_MEMBER);

    return {
      item: taskMembership,
    };
  },
};
