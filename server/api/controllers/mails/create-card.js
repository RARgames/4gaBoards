const moment = require('moment');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
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
    mailId: {
      type: 'string',
      required: true
    },
    position: {
      type: 'number'
    },
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true
    },
    dueDate: {
      type: 'string',
      custom: dueDateValidator
    },
    timer: {
      type: 'json',
      custom: timerValidator
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound'
    },
    listNotFound: {
      responseType: 'notFound'
    },
    notEnoughRights: {
      responseType: 'forbidden'
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity'
    },
  },

  async fn(inputs) {
    const { mail, list } = await sails.helpers.mails.getProjectPath(inputs.mailId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const currentUser = await User.findOne({ id: mail.userId });
    if (!currentUser) throw Errors.USER_NOT_FOUND;

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

    const values = _.pick(inputs, ['position', 'name', 'description', 'dueDate', 'timer']);

    const card = await sails.helpers.cards.createOne
      .with({
        values: {
          ...values,
          list,
          commentCount: 0,
        },
        currentUser,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    return {
      item: card
    };
  },
};
