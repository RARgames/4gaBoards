const moment = require('moment');

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
};

const dueDateValidator = (value) => moment(value, moment.ISO_8601, true).isValid();

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
    isCompleted: {
      type: 'boolean',
    },
    dueDate: {
      type: 'string',
      custom: dueDateValidator,
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

    const lastTask = await Task.find({
      where: { cardId: card.id },
      sort: 'position DESC',
      limit: 1,
    });

    const position = lastTask.length ? lastTask[0].position + 1 : 0;

    const values = _.pick(inputs, ['name', 'isCompleted', 'dueDate']);

    const task = await sails.helpers.tasks.createOne.with({
      values: {
        ...values,
        position,
        card,
      },
      currentUser,
      request: this.req,
    });

    return {
      item: task,
    };
  },
};
