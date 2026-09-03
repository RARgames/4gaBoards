const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

// Caps the window a client can ask for. The calendar view requests a month or a week; anything
// far beyond that is a mistake or an attempt to make the server expand years of recurrences.
const MAX_RANGE_DAYS = 400;

// Read path for the calendar view. Unlike the rest of the calendar endpoints this is not
// admin-only - anyone who can see the project can see the calendars linked to it.
module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    from: {
      type: 'string',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    invalidRange: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne({ id: inputs.projectId });

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const { isAdmin, isMember, isManager } = await sails.helpers.projects.getMembershipContext.with({ projectId: project.id, currentUser });

    if (!isAdmin && !isMember && !isManager) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const from = new Date(inputs.from);
    const to = new Date(inputs.to);

    if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || to <= from || (to - from) / 86400000 > MAX_RANGE_DAYS) {
      throw 'invalidRange';
    }

    // A calendar with no project is instance-wide, so this returns the project's own plus every
    // unpinned one - and only those an admin has left enabled.
    const linkedCalendars = await sails.helpers.linkedCalendars.getMany.with({ projectId: project.id, enabledOnly: true });

    const eventsPerCalendar = await Promise.all(linkedCalendars.map((linkedCalendar) => sails.helpers.linkedCalendars.fetchEvents.with({ linkedCalendar, from, to })));

    return {
      items: _.flatten(eventsPerCalendar),
      calendars: linkedCalendars.map((linkedCalendar) => _.pick(linkedCalendar, ['id', 'name', 'color'])),
    };
  },
};
