const { isValidColor } = require('../../../utils/colorValidator');

const Errors = {
  BOARD_NOT_FOUND: { boardNotFound: 'Board not found' },
};

const backgroundValidator = (value) => {
  if (_.isNull(value)) {
    return true;
  }

  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!Object.values(Project.BackgroundTypes).includes(value.type)) {
    return false;
  }

  if (value.type === Project.BackgroundTypes.COLOR && _.size(value) === 2 && isValidColor(value.color)) {
    return true;
  }

  if (value.type === Project.BackgroundTypes.GRADIENT && _.size(value) === 2 && Project.BACKGROUND_GRADIENTS.includes(value.name)) {
    return true;
  }

  if (value.type === Project.BackgroundTypes.IMAGE && _.size(value) === 1) {
    return true;
  }

  return false;
};

const backgroundImageValidator = (value) => _.isNull(value);

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    background: {
      type: 'json',
      custom: backgroundValidator,
    },
    backgroundImage: {
      type: 'json',
      custom: backgroundImageValidator,
    },
    thumbnail: {
      type: 'json',
      custom: backgroundValidator,
    },
    thumbnailImage: {
      type: 'json',
      custom: backgroundImageValidator,
    },
    isGithubConnected: {
      type: 'boolean',
    },
    githubRepo: {
      type: 'string',
    },
  },

  exits: {
    boardNotFound: { responseType: 'notFound' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let { board } = await sails.helpers.boards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, board.projectId);

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name', 'background', 'backgroundImage', 'thumbnail', 'thumbnailImage', 'isGithubConnected', 'githubRepo']);

    board = await sails.helpers.boards.updateOne.with({
      values,
      record: board,
      currentUser,
      request: this.req,
    });

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    return {
      item: board,
    };
  },
};
