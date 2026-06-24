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
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    isCollapsed: {
      type: 'boolean',
    },
    isCompleted: {
      type: 'boolean',
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

    // eslint-disable-next-line prefer-const
    let { list, board } = await sails.helpers.lists.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

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

    const values = _.pick(inputs, ['position', 'name', 'isCollapsed', 'isCompleted']);

    list = await sails.helpers.lists.updateOne.with({
      values,
      record: list,
      currentUser,
      request: this.req,
    });

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    const noCompletedListsLeft = values.isCompleted === false ? (await List.count({ boardId: list.boardId, isCompleted: true })) <= 0 : false;
    if (noCompletedListsLeft) {
      const [lastList] = await List.find({ boardId: board.id }).sort('position DESC').limit(1);
      const nextPosition = (lastList?.position || 0) + sails.config.custom.positionGap;

      await sails.helpers.lists.createOne.with({
        values: {
          name: 'common.done',
          position: nextPosition,
          isCollapsed: false,
          isCompleted: true,
          board,
        },
        currentUser,
      });
    }

    return {
      item: list,
    };
  },
};
