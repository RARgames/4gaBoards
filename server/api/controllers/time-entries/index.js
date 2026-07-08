const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    from: {
      type: 'string',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.userId && inputs.userId !== currentUser.id && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const targetUserId = inputs.userId && currentUser.isAdmin ? inputs.userId : currentUser.id;

    const timeEntries = await sails.helpers.timeEntries.getMany({
      userId: targetUserId,
      startedAt: { '<': new Date(inputs.to) },
      endedAt: { '>': new Date(inputs.from) },
    });

    if (inputs.subscribe && this.req.isSocket) {
      sails.sockets.join(this.req, `timesheet:${targetUserId}`);
    }

    return {
      items: timeEntries,
    };
  },
};
