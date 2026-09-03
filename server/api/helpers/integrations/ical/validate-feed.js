const MAX_PREVIEW_BYTES = 64 * 1024;

// Checks a pasted .ics address before it is stored, so an admin finds out immediately that a URL
// is wrong rather than discovering an empty calendar later. Also lifts the feed's own name out of
// X-WR-CALNAME so the add form can pre-fill something sensible.
//
// Only the first chunk is read: these feeds can be megabytes, and everything needed to tell a real
// calendar from a 404 page is in the opening lines.
module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidUrl: {},
    unreachable: {},
    notACalendar: {},
  },

  async fn(inputs) {
    let parsed;
    try {
      parsed = new URL(inputs.url);
    } catch {
      throw 'invalidUrl';
    }

    // Refuse anything but HTTPS: the URL is a bearer credential, and it is also user-supplied,
    // so this doubles as a guard against pointing the server at internal or non-web schemes.
    if (parsed.protocol !== 'https:') {
      throw 'invalidUrl';
    }

    let response;
    try {
      response = await fetch(inputs.url, { headers: { Accept: 'text/calendar' }, redirect: 'follow' });
    } catch {
      throw 'unreachable';
    }

    if (!response.ok) {
      throw { unreachable: `HTTP ${response.status}` };
    }

    const text = (await response.text()).slice(0, MAX_PREVIEW_BYTES);

    if (!text.includes('BEGIN:VCALENDAR')) {
      throw 'notACalendar';
    }

    const nameMatch = text.match(/^X-WR-CALNAME:(.*)$/m);

    return {
      name: nameMatch ? nameMatch[1].trim() : null,
    };
  },
};
