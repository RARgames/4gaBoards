const Errors = {
  LINKED_CALENDAR_NOT_FOUND: {
    linkedCalendarNotFound: 'Linked calendar not found',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  INVALID_FEED: {
    invalidFeed: 'Feed address is not a reachable calendar',
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
    },
    color: {
      type: 'string',
      isIn: LinkedCalendar.Colors,
    },
    isEnabled: {
      type: 'boolean',
    },
    feedUrl: {
      type: 'string',
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
  },

  exits: {
    linkedCalendarNotFound: {
      responseType: 'notFound',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    invalidFeed: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const linkedCalendar = await LinkedCalendar.findOne({ id: inputs.id });

    if (!linkedCalendar) {
      throw Errors.LINKED_CALENDAR_NOT_FOUND;
    }

    if (inputs.projectId) {
      const project = await Project.findOne({ id: inputs.projectId });

      if (!project) {
        throw Errors.PROJECT_NOT_FOUND;
      }
    }

    if (inputs.feedUrl) {
      try {
        await sails.helpers.integrations.ical.validateFeed(inputs.feedUrl);
      } catch {
        throw Errors.INVALID_FEED;
      }
    }

    const values = _.pick(inputs, ['name', 'color', 'isEnabled', 'feedUrl']);

    if (!_.isUndefined(inputs.projectId)) {
      values.projectId = inputs.projectId;
    }

    const updated = await sails.helpers.linkedCalendars.updateOne.with({ record: linkedCalendar, values, currentUser });

    return {
      item: sails.helpers.linkedCalendars.presentOne(updated),
    };
  },
};
