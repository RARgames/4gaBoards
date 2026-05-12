const Errors = {
  BOARD_TEMPLATE_NOT_FOUND: {
    boardTemplateNotFound: 'Board template not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  INVALID_NAME: {
    invalidName: 'Invalid name',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
    },
    isGlobal: {
      type: 'boolean',
    },
  },

  exits: {
    boardTemplateNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    invalidName: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let template = await BoardTemplate.findOne(inputs.id);

    if (!template) {
      throw Errors.BOARD_TEMPLATE_NOT_FOUND;
    }

    const isOwner = template.createdById === currentUser.id;

    if (template.isGlobal && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (!template.isGlobal && !isOwner) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.isGlobal !== undefined && inputs.isGlobal !== template.isGlobal && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'isGlobal']);

    if (values.name !== undefined) {
      values.name = values.name.trim();

      if (!values.name) {
        throw Errors.INVALID_NAME;
      }
    }

    template = await sails.helpers.boardTemplates.updateOne.with({
      record: template,
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: template,
    };
  },
};
