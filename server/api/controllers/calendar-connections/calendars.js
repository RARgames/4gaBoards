const Errors = {
  CONNECTION_NOT_FOUND: {
    connectionNotFound: 'Connection not found',
  },
  NEEDS_REAUTHORIZATION: {
    needsReauthorization: 'This connection needs to be re-authorized',
  },
};

// The calendars a connected Google account can see, so the admin picks from a list rather than
// pasting calendar ids. Deliberately not cached: it is read only while someone is looking at the
// settings page, and a stale list there is more confusing than an extra request is expensive.
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
    needsReauthorization: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const connection = await CalendarConnection.findOne({ id: inputs.id });

    if (!connection) {
      throw Errors.CONNECTION_NOT_FOUND;
    }

    let items;
    try {
      items = await sails.helpers.integrations.google.fetchCalendarList(connection);
    } catch {
      throw Errors.NEEDS_REAUTHORIZATION;
    }

    return { items };
  },
};
