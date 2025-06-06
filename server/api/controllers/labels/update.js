const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LABEL_NOT_FOUND: {
    labelNotFound: 'Label not found',
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
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    labelNotFound: {
      responseType: 'notFound',
    },
    invalidName: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let { label } = await sails.helpers.labels.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.LABEL_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: label.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'color']);

    label = await sails.helpers.labels.updateOne
      .with({
        values,
        record: label,
        currentUser,
        request: this.req,
      })
      .intercept('invalidName', () => Errors.INVALID_NAME);

    return {
      item: label,
    };
  },
};
