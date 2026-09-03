const Errors = {
  LINKED_CALENDAR_NOT_FOUND: {
    linkedCalendarNotFound: 'Linked calendar not found',
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
    linkedCalendarNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const linkedCalendar = await LinkedCalendar.findOne({ id: inputs.id });

    if (!linkedCalendar) {
      throw Errors.LINKED_CALENDAR_NOT_FOUND;
    }

    await sails.helpers.linkedCalendars.deleteOne(linkedCalendar);

    return {
      item: sails.helpers.linkedCalendars.presentOne(linkedCalendar),
    };
  },
};
