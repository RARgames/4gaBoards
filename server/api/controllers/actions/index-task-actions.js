const Errors = {
  TASK_NOT_FOUND: {
    taskNotFound: 'Task not found',
  },
};

module.exports = {
  inputs: {
    taskId: {
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
    taskNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { task, card, project } = await sails.helpers.tasks.getProjectPath(inputs.taskId).intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

      if (!isProjectManager) {
        throw Errors.TASK_NOT_FOUND; // Forbidden
      }
    }

    const actions = await sails.helpers.tasks.getActions(task.id, inputs.beforeId);
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
