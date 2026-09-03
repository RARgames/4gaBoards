// One entry point for events, whatever the calendar came from. Everything upstream - the
// controller, the client, the calendar grid - deals only in the normalized shape, so swapping a
// calendar between providers changes nothing above this line.
//
// A calendar that fails is recorded and returns no events rather than failing the request: one
// broken feed must not blank out the whole calendar view for every other calendar on it.
const cache = new Map();

// iCal feeds are fetched whole and Google caches them upstream for hours anyway, so a longer TTL
// here costs no freshness that was available in the first place. The API path is the one asked to
// look live, so it only dedupes bursts of requests for the same window.
const TTL_MS = {
  ical: 15 * 60 * 1000,
  google: 60 * 1000,
};

const cacheKey = (linkedCalendar, from, to) => `${linkedCalendar.id}:${linkedCalendar.updatedAt}:${from.toISOString()}:${to.toISOString()}`;

module.exports = {
  inputs: {
    linkedCalendar: {
      type: 'ref',
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

  async fn(inputs) {
    const { linkedCalendar, from, to } = inputs;

    const key = cacheKey(linkedCalendar, from, to);
    const hit = cache.get(key);

    if (hit && hit.expiresAt > Date.now()) {
      return hit.events;
    }

    let events;

    try {
      if (linkedCalendar.provider === LinkedCalendar.Providers.ICAL) {
        const url = sails.helpers.utils.decryptSecret(linkedCalendar.feedUrl);
        events = await sails.helpers.integrations.ical.fetchEvents.with({ linkedCalendar, url, from, to });
      } else {
        const connection = await CalendarConnection.findOne({ id: linkedCalendar.connectionId });

        if (!connection) {
          throw new Error('The connected account is gone');
        }

        events = await sails.helpers.integrations.google.fetchEvents.with({ linkedCalendar, connection, from, to });
      }
    } catch (error) {
      const message = error.unreachable || error.unparseable || error.requestFailed || error.message || 'This calendar could not be read';

      sails.log.warn('Calendar events: fetch failed', linkedCalendar.id, linkedCalendar.name, message);

      await LinkedCalendar.updateOne({ id: linkedCalendar.id }).set({ status: LinkedCalendar.Statuses.ERROR, lastError: message });

      return [];
    }

    // Only a success clears a previously recorded failure, so a calendar that recovers stops
    // showing a stale error without anyone having to touch it.
    if (linkedCalendar.status === LinkedCalendar.Statuses.ERROR) {
      await LinkedCalendar.updateOne({ id: linkedCalendar.id }).set({ status: LinkedCalendar.Statuses.ACTIVE, lastError: null });
    }

    await LinkedCalendar.updateOne({ id: linkedCalendar.id }).set({ lastSyncedAt: new Date() });

    cache.set(key, { events, expiresAt: Date.now() + (TTL_MS[linkedCalendar.provider] || TTL_MS.google) });

    return events;
  },
};
