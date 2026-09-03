module.exports.up = async (knex) => {
  await knex.schema.createTable('calendar_connection', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('provider').notNullable();
    table.text('account_email').notNullable();

    table.text('refresh_token').notNullable();
    table.text('access_token');
    table.timestamp('access_token_expires_at', true);

    table.text('status').notNullable().defaultTo('active');
    table.text('last_error');

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    // Re-authorizing an account that is already connected should refresh the existing row rather
    // than leave two connections racing to represent the same Google account.
    table.unique(['provider', 'account_email']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('calendar_connection');
};
