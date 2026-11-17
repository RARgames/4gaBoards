const path = require('path');
const rimraf = require('rimraf');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  if ((!_.isNil(value.background) && !_.isPlainObject(value.background)) || (!_.isNil(value.backgroundImage) && !_.isPlainObject(value.backgroundImage))) {
    return false;
  }

  if ((!_.isNil(value.thumbnail) && !_.isPlainObject(value.thumbnail)) || (!_.isNil(value.thumbnailImage) && !_.isPlainObject(value.thumbnailImage))) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    backgroundImageInValuesMustNotBeNull: {},
    thumbnailImageInValuesMustNotBeNull: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(inputs.record.projectId);

    const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.record.id);
    const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

    if (!_.isUndefined(values.position)) {
      const boards = await sails.helpers.projects.getBoards(inputs.record.projectId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, boards);

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Board.update({
          id,
          projectId: inputs.record.projectId,
        }).set({
          position: nextPosition,
        });

        boardRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
            item: {
              id,
              position: nextPosition,
            },
          });
        });
      });
    }

    if (values.backgroundImage) {
      values.background = {
        type: 'image',
      };
    } else if (_.isNull(values.backgroundImage) && inputs.record.background && inputs.record.background.type === 'image') {
      values.background = null;
    }

    if (values.thumbnailImage) {
      values.thumbnail = {
        type: 'image',
      };
    } else if (_.isNull(values.thumbnailImage) && inputs.record.thumbnail?.type === 'image') {
      values.thumbnail = null;
    }

    // Guards: setting type "image" without sending a new image is only allowed if the board already has one
    const criteria = { id: inputs.record.id };
    let isGuarded = false;
    let isBackgroundGuarded = false;
    let isThumbnailGuarded = false;

    if (values.background && values.background.type === 'image') {
      if (_.isNull(values.backgroundImage)) {
        throw 'backgroundImageInValuesMustNotBeNull';
      }

      if (_.isUndefined(values.backgroundImage)) {
        criteria.backgroundImage = { '!=': null };
        isBackgroundGuarded = true;
        isGuarded = true;
      }
    }

    if (values.thumbnail && values.thumbnail.type === 'image') {
      if (_.isNull(values.thumbnailImage)) {
        throw 'thumbnailImageInValuesMustNotBeNull';
      }

      if (_.isUndefined(values.thumbnailImage)) {
        criteria.thumbnailImage = { '!=': null };
        isThumbnailGuarded = true;
        isGuarded = true;
      }
    }

    let board;
    if (isGuarded) {
      board = await Board.updateOne(criteria).set({ updatedById: currentUser.id, ...values });

      if (!board) {
        const current = await Board.findOne(inputs.record.id);

        if (isBackgroundGuarded && !current?.backgroundImage) {
          delete values.background;
        }
        if (isThumbnailGuarded && !current?.thumbnailImage) {
          delete values.thumbnail;
        }
      }
    }

    if (!board) {
      board = await Board.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });
    }

    if (board) {
      if (inputs.record.backgroundImage && (!board.backgroundImage || board.backgroundImage.dirname !== inputs.record.backgroundImage.dirname)) {
        try {
          rimraf.sync(path.join(sails.config.custom.projectBackgroundImagesPath, inputs.record.backgroundImage.dirname));
        } catch (error) {
          sails.log.warn(error.stack);
        }
      }

      if (inputs.record.thumbnailImage && (!board.thumbnailImage || board.thumbnailImage.dirname !== inputs.record.thumbnailImage.dirname)) {
        try {
          rimraf.sync(path.join(sails.config.custom.projectBackgroundImagesPath, inputs.record.thumbnailImage.dirname));
        } catch (error) {
          sails.log.warn(error.stack);
        }
      }

      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardUpdate',
          {
            item: board,
          },
          inputs.request,
        );
      });

      await sails.helpers.actions.createOne.with({
        values: {
          board,
          scope: Action.Scopes.BOARD,
          type: Action.Types.BOARD_UPDATE,
          data: {
            boardId: board.id,
            boardPrevName: values.name && inputs.record.name,
            boardName: board.name,
            prevIsGithubConnected: values.isGithubConnected !== undefined ? inputs.record.isGithubConnected : undefined,
            isGithubConnected: board.isGithubConnected,
            prevGithubRepo: values.githubRepo !== undefined ? inputs.record.githubRepo : undefined,
            githubRepo: board.githubRepo,
            prevPosition: values.position ? inputs.record.position : undefined,
            position: values.position && board.position,
            prevBackground: values.background !== undefined ? inputs.record.background : undefined,
            background: values.background !== undefined ? board.background : undefined,
            prevBackgroundImage: values.backgroundImage !== undefined ? inputs.record.backgroundImage : undefined,
            backgroundImage: values.backgroundImage !== undefined ? board.backgroundImage : undefined,
            prevThumbnail: values.thumbnail !== undefined ? inputs.record.thumbnail : undefined,
            thumbnail: values.thumbnail !== undefined ? board.thumbnail : undefined,
            prevThumbnailImage: values.thumbnailImage !== undefined ? inputs.record.thumbnailImage : undefined,
            thumbnailImage: values.thumbnailImage !== undefined ? board.thumbnailImage : undefined,
          },
        },
        currentUser,
        request: inputs.request,
      });

      await sails.helpers.projects.updateMeta.with({ id: board.projectId, currentUser, skipMetaUpdate });
    }

    return board;
  },
};
