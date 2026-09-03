// The shape a linked calendar takes on the wire. feedUrl is deliberately absent - it is a bearer
// credential, and an admin panel is still a browser. Changing a feed means re-entering it.
module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    return {
      ..._.pick(inputs.record, ['id', 'provider', 'name', 'externalId', 'color', 'isEnabled', 'position', 'status', 'lastError', 'lastSyncedAt', 'connectionId', 'projectId', 'createdAt', 'updatedAt']),
      hasFeedUrl: !!inputs.record.feedUrl,
    };
  },
};
