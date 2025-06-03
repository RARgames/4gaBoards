module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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

  async fn(inputs) {
    const { values, currentUser } = inputs;
    const role = values.role || inputs.record.role;

    if (role === BoardMembership.Roles.EDITOR) {
      values.canComment = null;
    } else if (role === BoardMembership.Roles.VIEWER) {
      const canComment = _.isUndefined(values.canComment) ? inputs.record.canComment : values.canComment;

      if (_.isNull(canComment)) {
        values.canComment = false;
      }
    }

    const boardMembership = await BoardMembership.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (boardMembership) {
      sails.sockets.broadcast(
        `board:${boardMembership.boardId}`,
        'boardMembershipUpdate',
        {
          item: boardMembership,
        },
        inputs.request,
      );
    }

    return boardMembership;
  },
};
