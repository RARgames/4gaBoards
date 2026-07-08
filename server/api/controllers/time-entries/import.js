const fs = require('fs');
const util = require('util');
const fastcsv = require('fast-csv');
const moment = require('moment');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
  },
  PARSE_ERROR: {
    parseError: 'Could not parse the CSV file',
  },
  MAPPING_REQUIRED: {
    mappingRequired: 'Column mapping is required to confirm an import',
  },
  MEMBER_MAPPING_REQUIRED: {
    memberMappingRequired: 'A member column and member mapping are required for a team import',
  },
};

const HEADER_HINTS = {
  date: ['date'],
  start: ['first in', 'clock in', 'time in', 'start time', 'start'],
  end: ['last out', 'clock out', 'time out', 'end time', 'end'],
  duration: ['tracked hours', 'worked hours', 'duration', 'total time', 'total hours', 'hours'],
  activity: ['activity/project', 'activity', 'project'],
  note: ['note', 'notes', 'description', 'memo'],
  member: ['full name', 'employee name', 'employee', 'member', 'name'],
};

// Jibble (and Excel re-saves of its exports) represent an empty cell as a bare "-" or, when a
// leading apostrophe was used to force Excel to treat it as text, "'-". Both mean "no value".
const normalizeValue = (value) => {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim().replace(/^'/, '');
  return trimmed === '' || trimmed === '-' ? null : trimmed;
};

const detectColumn = (headers, hints) => {
  const lower = headers.map((header) => header.toLowerCase().trim());

  for (let i = 0; i < hints.length; i += 1) {
    const index = lower.indexOf(hints[i]);
    if (index !== -1) {
      return headers[index];
    }
  }

  for (let i = 0; i < hints.length; i += 1) {
    const index = lower.findIndex((header) => header.includes(hints[i]));
    if (index !== -1) {
      return headers[index];
    }
  }

  return null;
};

const parseCsv = (csvString) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fastcsv
      .parseString(csvString, { headers: true, trim: true, ignoreEmpty: true })
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });

const DATE_FORMATS = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'M/D/YYYY', 'D/M/YYYY', 'MMM D, YYYY', 'MMMM D, YYYY'];
const TIME_FORMATS = ['HH:mm:ss', 'HH:mm', 'hh:mm:ss A', 'hh:mm A', 'h:mm A', 'h:mm'];

const parseDatePart = (value) => {
  if (!value) {
    return null;
  }
  const strict = moment(value, DATE_FORMATS, true);
  if (strict.isValid()) {
    return strict;
  }
  const loose = moment(new Date(value));
  return loose.isValid() ? loose : null;
};

const parseTimePart = (value) => {
  if (!value) {
    return null;
  }
  const parsed = moment(value, TIME_FORMATS, true);
  return parsed.isValid() ? parsed : null;
};

const parseDurationMinutes = (value) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  const hms = /^(\d+):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (hms) {
    return Number(hms[1]) * 60 + Number(hms[2]) + (hms[3] ? Number(hms[3]) / 60 : 0);
  }
  const decimal = Number(trimmed);
  return Number.isNaN(decimal) ? null : decimal * 60;
};

// Converts a wall-clock date+time in `timeZone` to a UTC Date, using Intl only (no extra dependency).
const zonedTimeToUtc = (dateMoment, timeMoment, timeZone) => {
  const asUtc = new Date(Date.UTC(dateMoment.year(), dateMoment.month(), dateMoment.date(), timeMoment.hours(), timeMoment.minutes(), timeMoment.seconds()));
  const tzDate = new Date(asUtc.toLocaleString('en-US', { timeZone }));
  const offset = asUtc.getTime() - tzDate.getTime();
  return new Date(asUtc.getTime() + offset);
};

module.exports = {
  inputs: {
    mode: {
      type: 'string',
      isIn: ['preview', 'confirm'],
      defaultsTo: 'preview',
    },
    mapping: {
      type: 'json',
    },
    timezone: {
      type: 'string',
    },
    allMembers: {
      type: 'boolean',
      defaultsTo: false,
    },
    memberMapping: {
      type: 'json',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    parseError: {
      responseType: 'unprocessableEntity',
    },
    mappingRequired: {
      responseType: 'unprocessableEntity',
    },
    memberMappingRequired: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    if (inputs.allMembers && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const upload = util.promisify((options, callback) => this.req.file('file').upload(options, (error, files) => callback(error, files)));

    let files;
    try {
      files = await upload({ maxBytes: 5 * 1024 * 1024 });
    } catch (error) {
      return exits.parseError(error.message);
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    let csvString;
    try {
      csvString = fs.readFileSync(file.fd, 'utf8');
    } finally {
      fs.unlink(file.fd, () => {});
    }

    let rows;
    try {
      rows = await parseCsv(csvString);
    } catch {
      throw Errors.PARSE_ERROR;
    }

    if (rows.length === 0) {
      return exits.success({ columns: [], detectedMapping: {}, preview: [], memberValues: [], rowCount: 0 });
    }

    const columns = Object.keys(rows[0]);

    if (inputs.mode === 'preview') {
      const detectedMapping = {
        date: detectColumn(columns, HEADER_HINTS.date),
        start: detectColumn(columns, HEADER_HINTS.start),
        end: detectColumn(columns, HEADER_HINTS.end),
        duration: detectColumn(columns, HEADER_HINTS.duration),
        activity: detectColumn(columns, HEADER_HINTS.activity),
        note: detectColumn(columns, HEADER_HINTS.note),
        member: detectColumn(columns, HEADER_HINTS.member),
      };

      let memberValues = [];
      if (detectedMapping.member) {
        const seen = new Set();
        rows.forEach((row) => {
          const value = normalizeValue(row[detectedMapping.member]);
          if (value) {
            seen.add(value);
          }
        });
        memberValues = Array.from(seen).sort();
      }

      return exits.success({
        columns,
        detectedMapping,
        preview: rows.slice(0, 10),
        memberValues,
        rowCount: rows.length,
      });
    }

    const mapping = _.isString(inputs.mapping) ? JSON.parse(inputs.mapping) : inputs.mapping;

    if (!mapping || !mapping.date || !mapping.start) {
      throw Errors.MAPPING_REQUIRED;
    }

    const memberMapping = _.isString(inputs.memberMapping) ? JSON.parse(inputs.memberMapping) : inputs.memberMapping;

    if (inputs.allMembers && (!mapping.member || !memberMapping)) {
      throw Errors.MEMBER_MAPPING_REQUIRED;
    }

    const timeZone = inputs.timezone || 'UTC';

    let projects;
    if (inputs.allMembers) {
      // Admin-driven team import: match against every project, not just the importing admin's own memberships.
      projects = await Project.find({});
    } else {
      const projectMemberships = await ProjectMembership.find({ userId: currentUser.id });
      const projectIds = sails.helpers.utils.mapRecords(projectMemberships, 'projectId');
      projects = await Project.find({ id: projectIds });
    }
    const projectsByLowerName = new Map(projects.map((project) => [project.name.trim().toLowerCase(), project]));

    const existingKeysByUserId = new Map();
    if (inputs.allMembers) {
      const targetUserIds = Array.from(new Set(Object.values(memberMapping).filter(Boolean)));
      const existingEntries = await TimeEntry.find({ userId: targetUserIds });
      targetUserIds.forEach((userId) => existingKeysByUserId.set(userId, new Set()));
      existingEntries.forEach((entry) => {
        existingKeysByUserId.get(entry.userId).add(`${new Date(entry.startedAt).getTime()}|${new Date(entry.endedAt).getTime()}`);
      });
    } else {
      const existingEntries = await TimeEntry.find({ userId: currentUser.id });
      existingKeysByUserId.set(currentUser.id, new Set(existingEntries.map((entry) => `${new Date(entry.startedAt).getTime()}|${new Date(entry.endedAt).getTime()}`)));
    }

    let created = 0;
    let skipped = 0;
    let skippedEmpty = 0;
    let skippedUnmatched = 0;
    const failed = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowNumber = i + 2;

      let targetUserId = currentUser.id;
      if (inputs.allMembers) {
        const memberValue = normalizeValue(row[mapping.member]);
        targetUserId = memberValue ? memberMapping[memberValue] : null;

        if (!targetUserId) {
          skippedUnmatched += 1;
          continue; // eslint-disable-line no-continue
        }
      }

      const dateValue = normalizeValue(mapping.date ? row[mapping.date] : null);
      const startValue = normalizeValue(mapping.start ? row[mapping.start] : null);
      const endValue = normalizeValue(mapping.end ? row[mapping.end] : null);
      const durationValue = normalizeValue(mapping.duration ? row[mapping.duration] : null);
      const activityValue = normalizeValue(mapping.activity ? row[mapping.activity] : null);
      const noteValue = normalizeValue(mapping.note ? row[mapping.note] : null);

      if (!dateValue || !startValue) {
        // Nothing was tracked for this row (e.g. a day off) — not an error, just nothing to import.
        skippedEmpty += 1;
        continue; // eslint-disable-line no-continue
      }

      const dateMoment = parseDatePart(dateValue);
      const startMoment = parseTimePart(startValue);

      if (!dateMoment || !startMoment) {
        failed.push({ row: rowNumber, reason: 'Could not parse date/start time' });
      } else {
        const startedAt = zonedTimeToUtc(dateMoment, startMoment, timeZone);
        const endMoment = endValue ? parseTimePart(endValue) : null;

        let endedAt;
        if (endMoment) {
          endedAt = zonedTimeToUtc(dateMoment, endMoment, timeZone);
          if (endedAt <= startedAt) {
            endedAt = new Date(endedAt.getTime() + 24 * 60 * 60 * 1000);
          }
        } else {
          const durationMinutes = parseDurationMinutes(durationValue);
          endedAt = durationMinutes === null ? null : new Date(startedAt.getTime() + durationMinutes * 60000);
        }

        if (!endedAt) {
          failed.push({ row: rowNumber, reason: 'Could not determine end time or duration' });
        } else {
          const dedupeKey = `${startedAt.getTime()}|${endedAt.getTime()}`;
          if (!existingKeysByUserId.has(targetUserId)) {
            existingKeysByUserId.set(targetUserId, new Set());
          }
          const existingKeys = existingKeysByUserId.get(targetUserId);

          if (existingKeys.has(dedupeKey)) {
            skipped += 1;
          } else {
            let projectId = null;
            let description = noteValue || '';

            if (activityValue) {
              const match = projectsByLowerName.get(activityValue.toLowerCase());
              if (match) {
                projectId = match.id;
              } else {
                description = description ? `[${activityValue}] ${description}` : `[${activityValue}]`;
              }
            }

            try {
              // Sequential by design: each row's overlap check must see entries created earlier in this same import.
              await sails.helpers.timeEntries.createOne // eslint-disable-line no-await-in-loop
                .with({
                  values: {
                    userId: targetUserId,
                    startedAt,
                    endedAt,
                    description,
                    project: projectId ? { id: projectId } : undefined,
                    importedFrom: 'jibble',
                  },
                  currentUser,
                  request: this.req,
                })
                .intercept('overlap', () => 'overlap');

              existingKeys.add(dedupeKey);
              created += 1;
            } catch (error) {
              failed.push({ row: rowNumber, reason: error === 'overlap' ? 'Overlaps an existing entry' : 'Failed to create entry' });
            }
          }
        }
      }
    }

    return exits.success({
      created,
      skipped,
      skippedEmpty,
      skippedUnmatched,
      failed: failed.slice(0, 20),
      failedCount: failed.length,
    });
  },
};
