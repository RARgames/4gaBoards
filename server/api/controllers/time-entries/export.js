const fastcsv = require('fast-csv');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

const NO_PROJECT_LABEL = '(No project)';

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);
const formatTime = (date) => new Date(date).toISOString().slice(11, 16);
const durationHours = (startedAt, endedAt) => (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 3600000;

const buildRows = (entries, { groupBy, includeMember }, columns) => {
  const rows = [];
  let grandTotal = 0;

  const memberGroups = includeMember
    ? Object.values(
        entries.reduce((acc, entry) => {
          const key = entry.memberName;
          acc[key] = acc[key] || { memberName: key, entries: [] };
          acc[key].entries.push(entry);
          return acc;
        }, {}),
      )
    : [{ memberName: null, entries }];

  memberGroups.forEach(({ memberName, entries: memberEntries }) => {
    let memberTotal = 0;
    let currentGroupKey;
    let groupTotal = 0;
    let hasGroup = false;

    const flushGroup = () => {
      if (groupBy !== 'none' && hasGroup) {
        const row = Object.fromEntries(columns.map((column) => [column, '']));
        row.description = `Subtotal (${currentGroupKey})`;
        row.duration_hours = groupTotal.toFixed(2);
        if (includeMember) {
          row.member = memberName;
        }
        rows.push(row);
      }
      groupTotal = 0;
    };

    memberEntries.forEach((entry) => {
      let key = null;
      if (groupBy === 'day') {
        key = formatDate(entry.startedAt);
      } else if (groupBy === 'project') {
        key = entry.projectName || NO_PROJECT_LABEL;
      }

      if (groupBy !== 'none' && key !== currentGroupKey) {
        flushGroup();
        currentGroupKey = key;
        hasGroup = true;
      }

      const hours = durationHours(entry.startedAt, entry.endedAt);

      const row = {
        date: formatDate(entry.startedAt),
        start: formatTime(entry.startedAt),
        end: formatTime(entry.endedAt),
        duration_hours: hours.toFixed(2),
        description: entry.description || '',
        project: entry.projectName || '',
        card: entry.cardName || '',
        imported_from: entry.importedFrom || '',
      };
      if (includeMember) {
        row.member = memberName;
      }

      rows.push(row);

      groupTotal += hours;
      memberTotal += hours;
      grandTotal += hours;
    });

    flushGroup();

    if (includeMember) {
      const row = Object.fromEntries(columns.map((column) => [column, '']));
      row.description = `Total (${memberName})`;
      row.duration_hours = memberTotal.toFixed(2);
      row.member = memberName;
      rows.push(row);
    }
  });

  const totalRow = Object.fromEntries(columns.map((column) => [column, '']));
  totalRow.description = 'Total';
  totalRow.duration_hours = grandTotal.toFixed(2);
  rows.push(totalRow);

  return rows;
};

module.exports = {
  inputs: {
    from: {
      type: 'string',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    groupBy: {
      type: 'string',
      isIn: ['none', 'day', 'project'],
      defaultsTo: 'none',
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    allMembers: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    if ((inputs.allMembers || (inputs.userId && inputs.userId !== currentUser.id)) && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const criteria = {
      startedAt: { '<': new Date(inputs.to) },
      endedAt: { '>': new Date(inputs.from) },
    };

    if (inputs.allMembers) {
      // No userId filter — every member's entries are included.
    } else {
      criteria.userId = inputs.userId && currentUser.isAdmin ? inputs.userId : currentUser.id;
    }

    if (inputs.projectId) {
      criteria.projectId = inputs.projectId;
    }

    const timeEntries = await sails.helpers.timeEntries.getMany(criteria);

    const userIds = Array.from(new Set(timeEntries.map((timeEntry) => timeEntry.userId)));
    const projectIds = Array.from(new Set(timeEntries.filter((timeEntry) => timeEntry.projectId).map((timeEntry) => timeEntry.projectId)));
    const cardIds = Array.from(new Set(timeEntries.filter((timeEntry) => timeEntry.cardId).map((timeEntry) => timeEntry.cardId)));

    const [users, projects, cards] = await Promise.all([User.find({ id: userIds }), Project.find({ id: projectIds }), Card.find({ id: cardIds })]);

    const usersById = new Map(users.map((user) => [user.id, user]));
    const projectsById = new Map(projects.map((project) => [project.id, project]));
    const cardsById = new Map(cards.map((card) => [card.id, card]));

    const enrichedEntries = timeEntries.map((timeEntry) => ({
      ...timeEntry,
      memberName: usersById.has(timeEntry.userId) ? usersById.get(timeEntry.userId).name : timeEntry.userId,
      projectName: timeEntry.projectId && projectsById.has(timeEntry.projectId) ? projectsById.get(timeEntry.projectId).name : null,
      cardName: timeEntry.cardId && cardsById.has(timeEntry.cardId) ? cardsById.get(timeEntry.cardId).name : null,
    }));

    const columns = inputs.allMembers
      ? ['member', 'date', 'start', 'end', 'duration_hours', 'description', 'project', 'card', 'imported_from']
      : ['date', 'start', 'end', 'duration_hours', 'description', 'project', 'card', 'imported_from'];

    const rows = buildRows(enrichedEntries, { groupBy: inputs.groupBy, includeMember: inputs.allMembers }, columns);

    const csvString = await new Promise((resolve, reject) => {
      const chunks = [];
      const csvStream = fastcsv.format({ headers: columns });
      csvStream.on('data', (chunk) => chunks.push(chunk));
      csvStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      csvStream.on('error', reject);
      rows.forEach((row) => csvStream.write(row));
      csvStream.end();
    });

    const filename = `timesheet_${inputs.from.slice(0, 10)}_${inputs.to.slice(0, 10)}.csv`;

    this.res.type('text/csv');
    this.res.set('Content-Disposition', `attachment; filename="${filename}"`);

    return exits.success(csvString);
  },
};
