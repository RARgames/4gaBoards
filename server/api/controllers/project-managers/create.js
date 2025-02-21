const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_PROJECT_MANAGER: {
    userAlreadyProjectManager: 'User already project manager',
  },
  USER_ALREADY_BOARD_MEMBER: {
    userAlreadyBoardMember: 'User already board member',
  },
};

module.exports = {
  inputs: {
    projectId: {
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
    projectNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyProjectManager: {
      responseType: 'conflict',
    },
    userAlreadyBoardMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const user = await sails.helpers.users.getOne(inputs.userId);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const projectManager = await sails.helpers.projectManagers.createOne
      .with({
        values: {
          project,
          user,
        },
        request: this.req,
      })
      .intercept('userAlreadyProjectManager', () => Errors.USER_ALREADY_PROJECT_MANAGER);

    await sails.helpers.userProjects.createOne
      .with({
        values: {
          projectId: project.id,
          userId: user.id,
        },
        request: this.req,
      })
      .tolerate('E_UNIQUE');

    const boards = await sails.helpers.projects.getBoards(project.id);
    const boardMemberships = await Promise.all(
      boards.map(async (board) => {
        const currBoardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);
        if (currBoardMemberships.some((membership) => membership.userId === user.id)) {
          return null;
        }

        return sails.helpers.boardMemberships.createOne
          .with({
            values: {
              role: 'editor',
              canComment: null,
              board,
              user,
            },
            request: this.req,
          })
          .intercept('userAlreadyBoardMember', () => Errors.USER_ALREADY_BOARD_MEMBER);
      }),
    );

    const filteredBoardMemberships = boardMemberships.filter((membership) => membership !== null);

    return {
      item: projectManager,
      included: {
        boardMemberships: filteredBoardMemberships,
      },
    };
  },
};
