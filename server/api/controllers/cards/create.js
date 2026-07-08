const moment = require('moment');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  POSITION_MUST_BE_PRESENT: {
    positionMustBePresent: 'Position must be present',
  },
};

const dueDateValidator = (value) => moment(value, moment.ISO_8601, true).isValid();

const timerValidator = (value) => {
  if (!_.isPlainObject(value) || _.size(value) !== 2) {
    return false;
  }

  if (!_.isNull(value.startedAt) && _.isString(value.startedAt) && !moment(value.startedAt, moment.ISO_8601, true).isValid()) {
    return false;
  }

  if (!_.isFinite(value.total)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      custom: dueDateValidator,
    },
    startDate: {
      type: 'string',
      custom: dueDateValidator,
    },
    timer: {
      type: 'json',
      custom: timerValidator,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list } = await sails.helpers.lists.getProjectPath(inputs.listId).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

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

    const values = _.pick(inputs, ['position', 'name', 'description', 'dueDate', 'startDate', 'timer']);

    const card = await sails.helpers.cards.createOne
      .with({
        values: {
          ...values,
          list,
          commentCount: 0,
        },
        currentUser,
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    // Used for creating a card (Removing this due to Creating card not having details - will be sent via Updated method instead)
    // const { webhookUrl, notifyBoardIds } = await sails.helpers.integrations.discord.getConfig();
    // if (webhookUrl && notifyBoardIds.has(String(card.boardId))) {
    //   const payload = await sails.helpers.integrations.discord.buildCardPayload.with({
    //     card,
    //     currentUser,
    //     actionLabel: 'Card created',
    //     color: 0x57f287,
    //   });

    //   await sails.helpers.integrations.discord.sendWebhook.with({
    //     url: webhookUrl,
    //     payload,
    //   });
    // }

    return {
      item: card,
    };
  },
};
