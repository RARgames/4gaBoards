const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  INVALID_NAME: {
    invalidName: 'Invalid name',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isGlobal: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    invalidName: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards.getProjectPath(inputs.boardId).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });
    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager && boardMembership?.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.isGlobal && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const lists = await sails.helpers.boards.getLists(board.id);
    const labels = await sails.helpers.boards.getLabels(board.id);

    const templateName = inputs.name.trim();

    if (!templateName) {
      throw Errors.INVALID_NAME;
    }

    const template = await sails.helpers.boardTemplates.createOne.with({
      values: {
        name: templateName,
        isGlobal: inputs.isGlobal,
        data: {
          lists: lists.map((list) => _.pick(list, ['position', 'name', 'isCollapsed', 'isCompleted'])),
          labels: labels.map((label) => _.pick(label, ['name', 'color'])),
        },
      },
      currentUser,
      request: this.req,
    });

    return {
      item: template,
    };
  },
};
