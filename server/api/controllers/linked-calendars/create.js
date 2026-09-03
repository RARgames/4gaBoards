const Errors = {
  CONNECTION_NOT_FOUND: {
    connectionNotFound: 'Connection not found',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  INVALID_FEED: {
    invalidFeed: 'Feed address is not a reachable calendar',
  },
  FEED_URL_REQUIRED: {
    feedUrlRequired: 'An iCal calendar needs a feed address',
  },
  EXTERNAL_ID_REQUIRED: {
    externalIdRequired: 'A Google calendar needs a connection and a calendar id',
  },
};

module.exports = {
  inputs: {
    provider: {
      type: 'string',
      isIn: Object.values(LinkedCalendar.Providers),
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    feedUrl: {
      type: 'string',
    },
    connectionId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    externalId: {
      type: 'string',
    },
    color: {
      type: 'string',
      isIn: LinkedCalendar.Colors,
      required: true,
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
  },

  exits: {
    connectionNotFound: {
      responseType: 'notFound',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    invalidFeed: {
      responseType: 'unprocessableEntity',
    },
    feedUrlRequired: {
      responseType: 'unprocessableEntity',
    },
    externalIdRequired: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const values = { provider: inputs.provider, name: inputs.name, color: inputs.color, projectId: inputs.projectId || null };

    if (inputs.projectId) {
      const project = await Project.findOne({ id: inputs.projectId });

      if (!project) {
        throw Errors.PROJECT_NOT_FOUND;
      }
    }

    if (inputs.provider === LinkedCalendar.Providers.ICAL) {
      if (!inputs.feedUrl) {
        throw Errors.FEED_URL_REQUIRED;
      }

      // Proven reachable before it is stored, so a typo fails here rather than as an empty
      // calendar nobody can explain later.
      try {
        await sails.helpers.integrations.ical.validateFeed(inputs.feedUrl);
      } catch {
        throw Errors.INVALID_FEED;
      }

      values.feedUrl = inputs.feedUrl;
    } else {
      if (!inputs.connectionId || !inputs.externalId) {
        throw Errors.EXTERNAL_ID_REQUIRED;
      }

      const connection = await CalendarConnection.findOne({ id: inputs.connectionId });

      if (!connection) {
        throw Errors.CONNECTION_NOT_FOUND;
      }

      values.connectionId = connection.id;
      values.externalId = inputs.externalId;
    }

    const linkedCalendar = await sails.helpers.linkedCalendars.createOne.with({ values, currentUser });

    return {
      item: sails.helpers.linkedCalendars.presentOne(linkedCalendar),
    };
  },
};
