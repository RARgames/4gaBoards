const path = require('path');
const fs = require('fs');

module.exports = {
  inputs: {
    language: {
      type: 'string',
      defaultsTo: 'en',
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    projectNotFound: {},
  },

  async fn(inputs) {
    const currentUser = inputs.user;

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
      request: inputs.request,
    });

    await sails.helpers.userProjects.createOne.with({
      values: {
        projectId: project.id,
        userId: currentUser.id,
      },
      request: inputs.request,
    });

    if (!project) {
      throw 'projectNotFound';
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
      request: inputs.request,
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
