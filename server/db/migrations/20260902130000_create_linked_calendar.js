module.exports.up = async (knex) => {
  await knex.schema.createTable('linked_calendar', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    // Null for an iCal feed, which stands alone; set for a calendar reached through an
    // authorized Google account.
    table.bigInteger('connection_id');
    // Null means the calendar is shown on every project rather than pinned to one.
    table.bigInteger('project_id');

    table.text('provider').notNullable();
    table.text('name').notNullable();
    // Google's identifier for the calendar; unused by iCal feeds.
    table.text('external_id');
    // The secret .ics address, encrypted at rest - it is a bearer credential.
    table.text('feed_url');

    table.text('color').notNullable();
    table.boolean('is_enabled').notNullable().defaultTo(true);
    table.specificType('position', 'double precision').notNullable();

    table.text('status').notNullable().defaultTo('active');
    table.text('last_error');
    table.timestamp('last_synced_at', true);

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.index('connection_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('linked_calendar');
};
