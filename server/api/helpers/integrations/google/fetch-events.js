const CALENDARS_URL = 'https://www.googleapis.com/calendar/v3/calendars';
const MAX_PAGES = 10;

// singleEvents=true makes Google expand recurring events into individual occurrences server-side,
// which is the main reason this path is so much smaller than the iCal one: no RRULE, EXDATE or
// per-instance override handling here at all.
module.exports = {
  inputs: {
    linkedCalendar: {
      type: 'ref',
      required: true,
    },
    connection: {
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

  exits: {
    requestFailed: {},
  },

  async fn(inputs) {
    const { linkedCalendar } = inputs;
    const accessToken = await sails.helpers.calendarConnections.getAccessToken(inputs.connection);

    const items = [];
    let pageToken;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const params = new URLSearchParams({
        timeMin: inputs.from.toISOString(),
        timeMax: inputs.to.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '2500',
      });

      if (pageToken) {
        params.set('pageToken', pageToken);
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(`${CALENDARS_URL}/${encodeURIComponent(linkedCalendar.externalId)}/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        // eslint-disable-next-line no-await-in-loop
        const body = await response.json().catch(() => ({}));
        throw { requestFailed: body.error?.message || `HTTP ${response.status}` };
      }

      // eslint-disable-next-line no-await-in-loop
      const body = await response.json();
      items.push(...(body.items || []));

      pageToken = body.nextPageToken;

      if (!pageToken) {
        break;
      }
    }

    return items
      .filter((item) => item.status !== 'cancelled' && item.start)
      .map((item) => {
        const isAllDay = !item.start.dateTime;

        return sails.helpers.integrations.normalizeEvent.with({
          linkedCalendar,
          uid: item.id,
          title: item.summary || null,
          start: new Date(item.start.dateTime || item.start.date),
          end: new Date(item.end?.dateTime || item.end?.date || item.start.dateTime || item.start.date),
          isAllDay,
          location: item.location || null,
        });
      });
  },
};
