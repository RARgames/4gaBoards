const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  return true;
};

const importValidator = (value) => {
  if (!value.type || !Object.values(Board.ImportTypes).includes(value.type)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    import: {
      type: 'json',
      custom: importValidator,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
    request: {
      type: 'ref',
    },
  },
  exits: {
    boardCreateFailed: {},
    importFromBoardFailed: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(values.project.id);
    const boards = await sails.helpers.projects.getBoards(values.project.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, boards);

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Board.update({
        id,
        projectId: values.project.id,
      }).set({
        position: nextPosition,
      });

      // TODO: move out of loop
      const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(id);
      const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    });

    const board = await Board.create({
      ...values,
      position,
      projectId: values.project.id,
      createdById: currentUser.id,
    }).fetch();

    if (!board) {
      throw 'boardCreateFailed';
    }

    if (inputs.import && inputs.import.type === Board.ImportTypes.BOARDS) {
      await sails.helpers.boards.importFromBoards
        .with({
          currentUser,
          board,
          importTempDir: inputs.import.board.importTempDir,
          importFilePath: inputs.import.importFilePath,
          importNonExistingUsers: inputs.import.importNonExistingUsers,
          importProjectManagers: inputs.import.importProjectManagers,
          importGettingStartedProject: inputs.import.importGettingStartedProject,
          request: inputs.request,
        })
        .intercept('importFromBoardFailed', () => {
          throw 'importFromBoardFailed';
        });
    }
    if (inputs.import && inputs.import.type === Board.ImportTypes.TRELLO) {
      await sails.helpers.boards.importFromTrello.with({ currentUser, board, trelloBoard: inputs.import.board });
    }

    await BoardMembership.create({
      boardId: board.id,
      userId: currentUser.id,
      role: BoardMembership.Roles.EDITOR,
      createdById: currentUser.id,
    })
      .tolerate('E_UNIQUE')
      .fetch();
    const boardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);

    projectManagerUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'boardCreate',
        {
          item: board,
          requestId: inputs.requestId,
        },
        inputs.request,
      );
    });

    await sails.helpers.projects.updateMeta.with({ id: board.projectId, currentUser, skipMetaUpdate });

    return {
      board,
      boardMemberships,
    };
  },
};
