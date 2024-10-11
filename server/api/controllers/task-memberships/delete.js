const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  TASK_NOT_FOUND: {
    taskNotFound: 'Task not found',
  },
  USER_NOT_TASK_MEMBER: {
    userNotTaskMember: 'User not task member',
  },
};

module.exports = {
  inputs: {
    taskId: {
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
    taskNotFound: {
      responseType: 'notFound',
    },
    userNotTaskMember: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.tasks.getProjectPath(inputs.taskId).intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.TASK_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let taskMembership = await TaskMembership.findOne({
      taskId: inputs.taskId,
      userId: inputs.userId,
    });

    if (!taskMembership) {
      throw Errors.USER_NOT_TASK_MEMBER;
    }

    taskMembership = await sails.helpers.taskMemberships.deleteOne.with({
      board,
      record: taskMembership,
      request: this.req,
    });

    if (!taskMembership) {
      throw Errors.USER_NOT_TASK_MEMBER;
    }

    return {
      item: taskMembership,
    };
  },
};
