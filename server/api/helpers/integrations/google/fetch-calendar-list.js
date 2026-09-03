const CALENDAR_LIST_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';

// Everything the connected account can see, so the admin picks from a list instead of hunting
// down calendar ids by hand.
module.exports = {
  inputs: {
    connection: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    needsReauthorization: {},
    requestFailed: {},
  },

  async fn(inputs) {
    const accessToken = await sails.helpers.calendarConnections.getAccessToken(inputs.connection);

    const params = new URLSearchParams({ minAccessRole: 'reader', showDeleted: 'false', maxResults: '250' });
    const response = await fetch(`${CALENDAR_LIST_URL}?${params.toString()}`, { headers: { Authorization: `Bearer ${accessToken}` } });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw { requestFailed: body.error?.message || `HTTP ${response.status}` };
    }

    const body = await response.json();

    return (body.items || []).map((item) => ({
      externalId: item.id,
      name: item.summaryOverride || item.summary,
      description: item.description || null,
      isPrimary: !!item.primary,
    }));
  },
};
