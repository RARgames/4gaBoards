const FALLBACK_TIME_ZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// Formats `date` (a real instant) in `timeZone` and returns its wall-clock components there.
const getZonedParts = (date, timeZone) => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = dtf.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return {
    year: +parts.year,
    month: +parts.month,
    day: +parts.day,
    hour: parts.hour === '24' ? 0 : +parts.hour,
    minute: +parts.minute,
    second: +parts.second,
  };
};

// timeZone's offset from UTC (ms) at the instant `date` represents — DST-aware since it's derived
// from the actual formatted wall-clock time rather than a fixed offset table.
const getTimeZoneOffsetMs = (date, timeZone) => {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
};

// Returns a Date built via the *local* constructor from timeZone's wall-clock reading of the real
// instant `date` represents — so its local getters (getHours/getMinutes/getDate/...), read back in
// *this* environment regardless of the browser's own timezone, report timeZone's wall-clock time.
// This lets date-fns helpers that only know about "local" time (startOfDay, getHours, etc.)
// operate against an arbitrary zone instead. Building via the local Date constructor (rather than
// shifting date's epoch and relying on local getters to reinterpret it) is what makes this
// independent of the browser's own timezone — shifting the epoch would silently re-introduce the
// browser's own offset when read back with local getters.
export const utcToZonedTime = (date, timeZone) => {
  const p = getZonedParts(date, timeZone);
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, date.getMilliseconds());
};

// Inverse of utcToZonedTime: given a Date whose local getters represent a wall-clock time meant to
// be interpreted in `timeZone`, returns the real UTC instant for it. A second pass corrects the
// rare case where the first offset guess lands on the wrong side of a DST transition.
export const zonedTimeToUtc = (date, timeZone) => {
  const asIfUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));

  const offset = getTimeZoneOffsetMs(asIfUtc, timeZone);
  let result = new Date(asIfUtc.getTime() - offset);

  const offset2 = getTimeZoneOffsetMs(result, timeZone);
  if (offset2 !== offset) {
    result = new Date(asIfUtc.getTime() - offset2);
  }

  return result;
};

// The shared Dropdown component only matches its search box against the *start* of an option's
// name (see Dropdown.jsx's getOptions: `startsWith`, not `includes`), so a raw IANA id like
// "Asia/Tokyo" is unfindable by typing the city name most people actually think in. Leading with
// the city makes that search work while keeping the full id visible for disambiguation.
export const getTimeZoneLabel = (timeZone) => {
  const city = timeZone.includes('/') ? timeZone.slice(timeZone.lastIndexOf('/') + 1).replace(/_/g, ' ') : null;
  return city ? `${city} (${timeZone})` : timeZone;
};

export const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getEffectiveTimeZone = (preferredTimeZone) => preferredTimeZone || getBrowserTimeZone();

export const getSupportedTimeZones = () => {
  if (typeof Intl.supportedValuesOf === 'function') {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return FALLBACK_TIME_ZONES;
    }
  }
  return FALLBACK_TIME_ZONES;
};

export default {
  utcToZonedTime,
  zonedTimeToUtc,
  getTimeZoneLabel,
  getBrowserTimeZone,
  getEffectiveTimeZone,
  getSupportedTimeZones,
};
