const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  ENTRY_NOT_FOUND: {
    entryNotFound: 'Time entry not found',
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    entryNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const record = await sails.helpers.timeEntries.getOne(inputs.id);

    if (!record) {
      throw Errors.ENTRY_NOT_FOUND;
    }

    if (record.userId !== currentUser.id && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const timeEntry = await sails.helpers.timeEntries.deleteOne.with({
      record,
      request: this.req,
    });

    return {
      item: timeEntry,
    };
  },
};
