const crypto = require('crypto');

const Errors = {
  MISSING_RELATIONS: {
    missingRelations: 'Missing required related entities',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    missingRelations: {
      responseType: 'badRequest',
    },
  },

  async fn(inputs) {
    const mailId = crypto.randomBytes(8).toString('hex');

    const { currentUser } = this.req;

    const mail = await Mail.create({
      mailId,
      userId: currentUser.id,
      projectId: inputs.projectId,
      boardId: inputs.boardId,
      listId: inputs.listId,
    }).fetch();

    return {
      item: mail,
    };
  },
};
