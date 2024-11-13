const path = require('path');
const fs = require('fs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    language: {
      type: 'string',
      defaultsTo: 'en',
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let { language } = inputs;
    const directories = fs
      .readdirSync(sails.config.custom.gettingStartedProjectsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    if (!directories.includes(language)) {
      language = 'en';
    }

    const data = await sails.helpers.utils.loadCsvs(path.join(sails.config.custom.gettingStartedProjectsPath, language), ['projects', 'boards']);

    const { project, projectManager } = await sails.helpers.projects.createOne.with({
      values: { name: data.projects[0].name },
      user: currentUser,
      request: this.req,
    });

    await sails.helpers.userProjects.createOne.with({
      values: {
        projectId: project.id,
        userId: currentUser.id,
      },
      request: this.req,
    });

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }
    const boardImport = {
      type: Board.ImportTypes.BOARDS,
      board: { importTempDir: path.join(sails.config.custom.gettingStartedProjectsPath, language) },
      importFilePath: path.join(sails.config.custom.gettingStartedProjectsPath, language),
      importNonExistingUsers: false,
      importProjectManagers: false,
      importGettingStartedProject: true,
    };

    const { board, boardMembership } = await sails.helpers.boards.createOne.with({
      values: {
        name: data.boards[0].name,
        position: sails.config.custom.positionGap,
        isGithubConnected: false,
        project,
        isImportedBoard: true,
      },
      import: boardImport,
      user: currentUser,
      request: this.req,
    });

    return {
      item: project,
      included: {
        projectManagers: [projectManager],
        boards: [board],
        boardMemberships: [boardMembership],
      },
    };
  },
};
