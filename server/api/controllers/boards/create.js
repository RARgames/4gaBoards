const util = require('util');
const { v4: uuid } = require('uuid');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  BOARD_CREATE_FAILED: {
    boardCreateFailed: 'Board create failed',
  },
  IMPORT_FROM_BOARD_FAILED: {
    importFromBoardFailed: 'Import from board failed',
  },
  NO_IMPORT_FILE_WAS_UPLOADED: {
    noImportFileWasUploaded: 'No import file was uploaded',
  },
  INVALID_IMPORT_FILE: {
    invalidImportFile: 'Invalid import file',
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
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isGithubConnected: {
      type: 'boolean',
      required: true,
    },
    githubRepo: {
      type: 'string',
    },
    importType: {
      type: 'string',
      isIn: Object.values(Board.ImportTypes),
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
    lists: {
      type: 'json',
    },
    importNonExistingUsers: {
      type: 'boolean',
    },
    importProjectManagers: {
      type: 'boolean',
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    boardCreateFailed: {
      responseType: 'notFound',
    },
    noImportFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
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

    const values = _.pick(inputs, ['position', 'name', 'isGithubConnected', 'githubRepo']);

    let boardImport;
    if (inputs.importType && Object.values(Board.ImportTypes).includes(inputs.importType)) {
      const upload = util.promisify((options, callback) => this.req.file('importFile').upload(options, (error, files) => callback(error, files)));

      let files;
      try {
        files = await upload({
          saveAs: uuid(),
          maxBytes: null,
        });
      } catch (error) {
        return exits.uploadError(error.message); // TODO: add error
      }

      if (files.length === 0) {
        throw Errors.NO_IMPORT_FILE_WAS_UPLOADED;
      }

      const file = _.last(files);

      if (inputs.importType === Board.ImportTypes.BOARDS) {
        boardImport = {
          type: inputs.importType,
          board: await sails.helpers.boards.processUploadedBoardsImportFile(file),
          importFilePath: file.fd,
          importNonExistingUsers: currentUser.isAdmin ? inputs.importNonExistingUsers : false,
          importProjectManagers: inputs.importProjectManagers,
        };
      }
      if (inputs.importType === Board.ImportTypes.TRELLO) {
        boardImport = {
          type: inputs.importType,
          board: await sails.helpers.boards.processUploadedTrelloImportFile(file),
        };
      }
    }

    const { board, boardMemberships } = await sails.helpers.boards.createOne
      .with({
        values: {
          ...values,
          project,
          isImportedBoard: !!inputs.importType,
        },
        import: boardImport,
        currentUser,
        requestId: inputs.requestId,
        request: this.req,
      })
      .intercept('boardCreateFailed', () => Errors.BOARD_CREATE_FAILED)
      .intercept('importFromBoardFailed', () => Errors.IMPORT_FROM_BOARD_FAILED);

    if (inputs.lists && !inputs.importType) {
      inputs.lists.map(async (list) => {
        const valuesList = _.pick(list, ['position', 'name', 'isCollapsed']);
        await sails.helpers.lists.createOne.with({
          values: {
            ...valuesList,
            board,
          },
          currentUser,
          request: this.req,
        });
      });
    }

    const projectManagers = await sails.helpers.projects.getProjectManagers(project.id);
    const projectManagerBoardMemberships = await Promise.all(
      projectManagers.map(async (projectManager) => {
        if (boardMemberships?.some((m) => m.userId === projectManager.userId)) {
          return null;
        }
        const user = await sails.helpers.users.getOne(projectManager.userId);
        if (!user) {
          return null;
        }
        const boardMember = await sails.helpers.boardMemberships.getMany({ userId: user.id, boardId: board.id });
        if (boardMember && boardMember.length > 0) {
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
            currentUser,
            request: this.req,
          })
          .intercept('userAlreadyBoardMember', () => Errors.USER_ALREADY_BOARD_MEMBER);
      }),
    );
    const filteredProjectManagerBoardMemberships = projectManagerBoardMemberships.filter((membership) => membership !== null);
    const allBoardMemberships = [...(boardMemberships ?? []), ...filteredProjectManagerBoardMemberships];

    return {
      item: board,
      included: {
        boardMemberships: allBoardMemberships,
      },
    };
  },
};
