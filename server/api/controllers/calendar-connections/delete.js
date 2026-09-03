const Errors = {
  CONNECTION_NOT_FOUND: {
    connectionNotFound: 'Connection not found',
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
    connectionNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const connection = await CalendarConnection.findOne({ id: inputs.id });

    if (!connection) {
      throw Errors.CONNECTION_NOT_FOUND;
    }

    await sails.helpers.calendarConnections.deleteOne(connection);

    return {
      item: sails.helpers.calendarConnections.presentOne(connection),
    };
  },
};
