const Errors = {
  BOARD_TEMPLATE_NOT_FOUND: {
    boardTemplateNotFound: 'Board template not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    boardTemplateNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
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

    template = await sails.helpers.boardTemplates.deleteOne.with({
      record: template,
      currentUser,
      request: this.req,
    });

    return {
      item: template,
    };
  },
};
