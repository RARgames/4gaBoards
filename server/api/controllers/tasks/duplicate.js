const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  TASK_NOT_FOUND: {
    taskNotFound: 'Task not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    taskNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { task, card, board } = await sails.helpers.tasks.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.TASK_NOT_FOUND;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const newTask = await sails.helpers.tasks.createOne.with({
      values: {
        ..._.omit(task, ['id', 'cardId']), // Omit the id to ensure a new task is created
        card,
      },
      currentUser,
      duplicate: true,
      request: this.req,
    });

    const taskMemberships = await sails.helpers.tasks.getTaskMemberships(task.id);
    await Promise.all(
      taskMemberships.map((taskMembership) => {
        return sails.helpers.taskMemberships.createOne.with({
          values: {
            card,
            taskId: newTask.id,
            userId: taskMembership.userId,
          },
          currentUser,
          skipActions: true,
          request: this.req,
        });
      }),
    );

    const newTaskMemberships = await sails.helpers.tasks.getTaskMemberships(newTask.id);

    return {
      item: newTask,
      included: {
        taskMemberships: newTaskMemberships,
      },
    };
  },
};
