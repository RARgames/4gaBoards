/**
 * LinkedCalendar.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Providers = {
  ICAL: 'ical',
  GOOGLE: 'google',
};

const Statuses = {
  ACTIVE: 'active',
  ERROR: 'error',
};

// Mirrors the client's LabelColors, so a calendar renders with the palette classes the app
// already ships rather than needing colour CSS of its own.
const Colors = [
  'berry-red',
  'pumpkin-orange',
  'lagoon-blue',
  'pink-tulip',
  'light-mud',
  'orange-peel',
  'bright-moss',
  'antique-blue',
  'dark-granite',
  'lagune-blue',
  'sunny-grass',
  'morning-sky',
  'light-orange',
  'midnight-blue',
  'tank-green',
  'gun-metal',
  'wet-moss',
  'red-burgundy',
  'light-concrete',
  'apricot-red',
  'desert-sand',
  'navy-blue',
  'egg-yellow',
  'coral-green',
  'light-cocoa',
];

module.exports = {
  Providers,
  Statuses,
  Colors,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    provider: {
      type: 'string',
      isIn: Object.values(Providers),
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    externalId: {
      type: 'string',
      allowNull: true,
      columnName: 'external_id',
    },
    // Encrypted by sails.helpers.utils.encryptSecret. Anyone holding this URL can read the
    // calendar, so it must never leave the server - see linkedCalendars.presentOne.
    feedUrl: {
      type: 'string',
      allowNull: true,
      columnName: 'feed_url',
    },
    color: {
      type: 'string',
      isIn: Colors,
      required: true,
    },
    isEnabled: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_enabled',
    },
    position: {
      type: 'number',
      required: true,
    },
    status: {
      type: 'string',
      isIn: Object.values(Statuses),
      defaultsTo: Statuses.ACTIVE,
    },
    lastError: {
      type: 'string',
      allowNull: true,
      columnName: 'last_error',
    },
    lastSyncedAt: {
      type: 'ref',
      columnType: 'timestamp',
      columnName: 'last_synced_at',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    connectionId: {
      model: 'CalendarConnection',
      columnName: 'connection_id',
    },
    projectId: {
      model: 'Project',
      columnName: 'project_id',
    },
    createdById: {
      model: 'User',
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },

  tableName: 'linked_calendar',
};
