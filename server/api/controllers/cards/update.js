const moment = require('moment');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  LIST_MUST_BE_PRESENT: {
    listMustBePresent: 'List must be present',
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
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    coverAttachmentId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    priority: {
      type: 'string',
      isIn: ['low', 'medium', 'high'],
      allowNull: true,
    },
    parentCardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      custom: dueDateValidator,
      allowNull: true,
    },
    timer: {
      type: 'json',
      custom: timerValidator,
    },
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    listMustBePresent: {
      responseType: 'unprocessableEntity',
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let { card } = path;
    const { list, board } = path;

    let boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    const isEditor = boardMembership.role === BoardMembership.Roles.EDITOR;
    if (!isEditor) {
      const allowedOnlyIsSubscribed = Object.keys(inputs).every((key) => ['id', 'isSubscribed'].includes(key));
      if (!allowedOnlyIsSubscribed) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let nextBoard;
    if (!_.isUndefined(inputs.boardId)) {
      ({ board: nextBoard } = await sails.helpers.boards.getProjectPath(inputs.boardId).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND));

      boardMembership = await BoardMembership.findOne({
        boardId: nextBoard.id,
        userId: currentUser.id,
      });

      if (!boardMembership) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let nextList;
    if (!_.isUndefined(inputs.listId)) {
      nextList = await List.findOne({
        id: inputs.listId,
        boardId: (nextBoard || board).id,
      });

      if (!nextList) {
        throw Errors.LIST_NOT_FOUND; // Forbidden
      }
    }

    const values = _.pick(inputs, ['coverAttachmentId', 'priority', 'parentCardId', 'position', 'name', 'description', 'dueDate', 'timer', 'isSubscribed']);

    const formatAssignedUsers = async () => {
      const memberships = await sails.helpers.cardMemberships.getMany({ cardId: card.id });
      const memberUserIds = memberships.map((membership) => membership.userId);
      const memberUsers = memberUserIds.length ? await User.find({ id: memberUserIds }) : [];
      return memberUsers.length > 0
        ? memberUsers.map((user) => user.name || user.username || user.email || `${user.id}`).join(', ')
        : 'Unassigned';
    };

    const beforeAssignedUsers = await formatAssignedUsers();
    const beforeName = card.name || '';
    const beforeDescription = card.description || '';
    const beforeListId = list.id;

    card = await sails.helpers.cards.updateOne
      .with({
        board,
        list,
        record: card,
        values: {
          ...values,
          board: nextBoard,
          list: nextList,
        },
        currentUser,
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT)
      .intercept('listMustBeInValues', () => Errors.LIST_MUST_BE_PRESENT);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    const { webhookUrl, notifyBoardIds, boardLinks } = await sails.helpers.integrations.discord.getConfig();
    if (webhookUrl && notifyBoardIds.has(String(card.boardId))) {
      const afterAssignedUsers = await formatAssignedUsers();
      const columnChanged = String(beforeListId) !== String(card.listId);
      const assignedChanged = beforeAssignedUsers !== afterAssignedUsers;
      const nameChanged = beforeName !== (card.name || '');
      const descriptionChanged = beforeDescription !== (card.description || '');

      if (columnChanged || assignedChanged || nameChanged || descriptionChanged) {
        const currentList = await List.findOne({ id: card.listId });
        const currentState = currentList?.name || 'Unknown';
        const stateFieldValue = columnChanged && list?.name ? `${list.name} → ${currentState}` : currentState;

        const onlyStateChanged = columnChanged && !assignedChanged && !nameChanged && !descriptionChanged;

        if (onlyStateChanged) {
          const boardLink = boardLinks[String(card.boardId)] || `https://kanban.lucidrainstudios.com/boards/${card.boardId}`;
          const cardLink = boardLink.includes('/boards/')
            ? boardLink.replace(/\/boards\/[^/]+/, `/cards/${card.id}`)
            : `https://kanban.lucidrainstudios.com/cards/${card.id}`;

          const payload = {
            username: 'LRS Kanban',
            embeds: [
              {
                title: `[Card moved] ${card.name}`,
                url: cardLink,
                color: 0xfaa61a,
                fields: [
                  { name: 'Assigned User(s)', value: `👤__**${afterAssignedUsers}**__`, inline: true },
                  { name: 'Current State', value: `🚦${stateFieldValue}`, inline: true },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          };

          await sails.helpers.integrations.discord.sendWebhook.with({
            url: webhookUrl,
            payload,
          });
        } else {
          const payload = await sails.helpers.integrations.discord.buildCardPayload.with({
            card,
            currentUser,
            actionLabel: 'Card updated',
            color: 0x57f287,
            previousListName: list?.name,
          });

          await sails.helpers.integrations.discord.sendWebhook.with({
            url: webhookUrl,
            payload,
          });
        }
      }
    }

    return {
      item: card,
    };
  },
};
