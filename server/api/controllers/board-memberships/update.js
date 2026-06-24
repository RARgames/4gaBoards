const Errors = {
  BOARD_MEMBERSHIP_NOT_FOUND: {
    boardMembershipNotFound: 'Board membership not found',
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
    role: {
      type: 'string',
      isIn: Object.values(BoardMembership.Roles),
    },
    canComment: {
      type: 'boolean',
    },
    isSubscribed: {
      type: 'boolean',
    },
    hideCompletedLists: {
      type: 'boolean',
    },
  },

  exits: {
    boardMembershipNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.boardMemberships.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_MEMBERSHIP_NOT_FOUND);

    let { boardMembership } = path;
    const { project } = path;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      const isSelf = boardMembership.userId === currentUser.id;
      const onlySelfPrefs = Object.keys(inputs).every((key) => ['id', 'isSubscribed', 'hideCompletedLists'].includes(key));

      if (!isSelf || !onlySelfPrefs) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['role', 'canComment', 'isSubscribed', 'hideCompletedLists']);

    boardMembership = await sails.helpers.boardMemberships.updateOne.with({
      values,
      record: boardMembership,
      currentUser,
      request: this.req,
    });

    return {
      item: boardMembership,
    };
  },
};
