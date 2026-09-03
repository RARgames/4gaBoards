const IcalExpander = require('ical-expander');

// Caps how far ical.js will iterate a recurrence rule while looking for occurrences in the
// window. Without a bound, an unbounded daily rule starting years ago makes this pathological.
const MAX_ITERATIONS = 1000;

// Unlike the Google path there is no server-side expansion to lean on: the feed hands over raw
// RRULE/EXDATE/RECURRENCE-ID records and ical-expander (on Mozilla's ical.js) expands them into
// the requested window. `between` returns one-off events and recurrence occurrences separately;
// an occurrence carries its own start/end but inherits summary and location from its parent.
module.exports = {
  inputs: {
    linkedCalendar: {
      type: 'ref',
      required: true,
    },
    url: {
      type: 'string',
      required: true,
    },
    from: {
      type: 'ref',
      required: true,
    },
    to: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    unreachable: {},
    unparseable: {},
  },

  async fn(inputs) {
    const { linkedCalendar } = inputs;

    let ics;
    try {
      const response = await fetch(inputs.url, { headers: { Accept: 'text/calendar' }, redirect: 'follow' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      ics = await response.text();
    } catch (error) {
      throw { unreachable: error.message || 'Feed could not be fetched' };
    }

    let expanded;
    try {
      expanded = new IcalExpander({ ics, maxIterations: MAX_ITERATIONS }).between(inputs.from, inputs.to);
    } catch (error) {
      throw { unparseable: error.message || 'Feed could not be parsed' };
    }

    const toEvent = (uid, summary, location, startTime, endTime) =>
      sails.helpers.integrations.normalizeEvent.with({
        linkedCalendar,
        uid,
        title: summary || null,
        start: startTime.toJSDate(),
        end: endTime ? endTime.toJSDate() : startTime.toJSDate(),
        // ical.js marks a date-only value (no time component) with isDate, which is exactly the
        // all-day case.
        isAllDay: !!startTime.isDate,
        location: location || null,
      });

    return [
      ...expanded.events.map((event) => toEvent(event.uid, event.summary, event.location, event.startDate, event.endDate)),
      ...expanded.occurrences.map((occurrence) => toEvent(occurrence.item.uid, occurrence.item.summary, occurrence.item.location, occurrence.startDate, occurrence.endDate)),
    ];
  },
};
