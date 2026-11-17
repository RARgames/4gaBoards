const path = require('path');
const rimraf = require('rimraf');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isNil(value.background) && !_.isPlainObject(value.background)) {
    return false;
  }

  if (!_.isNil(value.backgroundImage) && !_.isPlainObject(value.backgroundImage)) {
    return false;
  }

  if (!_.isNil(value.thumbnail) && !_.isPlainObject(value.thumbnail)) {
    return false;
  }

  if (!_.isNil(value.thumbnailImage) && !_.isPlainObject(value.thumbnailImage)) {
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
    request: {
      type: 'ref',
    },
  },

  exits: {
    backgroundImageInValuesMustNotBeNull: {},
    thumbnailImageInValuesMustNotBeNull: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

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

    // Guards: setting type "image" without sending a new image is only allowed if the project already has one
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

    let project;
    if (isGuarded) {
      project = await Project.updateOne(criteria).set({ updatedById: currentUser.id, ...values });

      if (!project) {
        const current = await Project.findOne(inputs.record.id);

        if (isBackgroundGuarded && !current?.backgroundImage) {
          delete values.background;
        }
        if (isThumbnailGuarded && !current?.thumbnailImage) {
          delete values.thumbnail;
        }
      }
    }

    if (!project) {
      project = await Project.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });
    }

    if (project) {
      if (inputs.record.backgroundImage && (!project.backgroundImage || project.backgroundImage.dirname !== inputs.record.backgroundImage.dirname)) {
        try {
          rimraf.sync(path.join(sails.config.custom.projectBackgroundImagesPath, inputs.record.backgroundImage.dirname));
        } catch (error) {
          sails.log.warn(error.stack);
        }
      }

      if (inputs.record.thumbnailImage && (!project.thumbnailImage || project.thumbnailImage.dirname !== inputs.record.thumbnailImage.dirname)) {
        try {
          rimraf.sync(path.join(sails.config.custom.projectBackgroundImagesPath, inputs.record.thumbnailImage.dirname));
        } catch (error) {
          sails.log.warn(error.stack);
        }
      }

      const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(project.id);

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectUpdate',
          {
            item: project,
          },
          inputs.request,
        );
      });

      await sails.helpers.actions.createOne.with({
        values: {
          project,
          scope: Action.Scopes.PROJECT,
          type: Action.Types.PROJECT_UPDATE,
          data: {
            projectId: project.id,
            projectPrevName: values.name && inputs.record.name,
            projectName: project.name,
            projectPrevBackground: values.background !== undefined ? inputs.record.background : undefined,
            projectBackground: values.background !== undefined ? project.background : undefined,
            projectPrevBackgroundImage: values.backgroundImage !== undefined ? inputs.record.backgroundImage : undefined,
            projectBackgroundImage: values.backgroundImage !== undefined ? project.backgroundImage : undefined,
            projectPrevThumbnail: values.thumbnail !== undefined ? inputs.record.thumbnail : undefined,
            projectThumbnail: values.thumbnail !== undefined ? project.thumbnail : undefined,
            projectPrevThumbnailImage: values.thumbnailImage !== undefined ? inputs.record.thumbnailImage : undefined,
            projectThumbnailImage: values.thumbnailImage !== undefined ? project.thumbnailImage : undefined,
          },
        },
        currentUser,
        request: inputs.request,
      });
    }

    return project;
  },
};
