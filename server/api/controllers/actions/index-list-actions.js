const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    beforeId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists.getProjectPath(inputs.listId).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

      if (!isProjectManager) {
        throw Errors.LIST_NOT_FOUND; // Forbidden
      }
    }

    const actions = await sails.helpers.lists.getActions(list.id, inputs.beforeId);
    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);

    return {
      items: actions,
      included: {
        users,
      },
    };
  },
};
