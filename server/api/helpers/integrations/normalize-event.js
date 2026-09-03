// One shape for both providers, so nothing downstream needs to know where an event came from.
//
// endDate is stored as the INCLUSIVE last day an event covers. Both Google and iCal report an
// exclusive end for all-day events - a one-day event on the 5th ends on the 6th - which would
// otherwise render every all-day event a day too long.
module.exports = {
  sync: true,

  inputs: {
    linkedCalendar: {
      type: 'ref',
      required: true,
    },
    uid: {
      type: 'string',
      required: true,
    },
    title: {
      type: 'string',
      allowNull: true,
    },
    start: {
      type: 'ref',
      required: true,
    },
    end: {
      type: 'ref',
      required: true,
    },
    isAllDay: {
      type: 'boolean',
      required: true,
    },
    location: {
      type: 'string',
      allowNull: true,
    },
  },

  fn(inputs) {
    const { linkedCalendar, start, isAllDay } = inputs;

    let { end } = inputs;

    if (isAllDay) {
      const inclusive = new Date(end);
      inclusive.setDate(inclusive.getDate() - 1);
      // Guard the degenerate case of an all-day event whose end is not after its start.
      end = inclusive < start ? start : inclusive;
    }

    return {
      // Stable across refetches, and unique per occurrence of a recurring event, so React keys
      // and selection survive a reload.
      id: `${linkedCalendar.id}:${inputs.uid}:${start.toISOString()}`,
      calendarId: linkedCalendar.id,
      calendarName: linkedCalendar.name,
      color: linkedCalendar.color,
      title: inputs.title || '(no title)',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isAllDay,
      location: inputs.location || null,
    };
  },
};
